// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
//ДОДЕЛАТЬ УДАЛЕНИЕ ПРИ 50на50
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";

import "./PROFI.sol";

contract DAO is Governor, GovernorVotes, GovernorVotesQuorumFraction, GovernorCountingSimple{

    ERC20 PROFi;
    ERC20 RTK;

    struct user{
        address owner;
        string name;
        bool statys;
    }
    struct Propose{
        uint id;
        ProposeType category; // тип предложения
        Voting voting; // структура голосования
        address owner;
        bool isActive;//АКТИВНЫЙ ИЛИ НЕ АКТИВНЫЙ
    }
    enum ProposeType{
        none,
        A, // Инвестирование в новый стартап (Тип A)
        B, // Добавление новых инвестиций в стартап, в который ранее уже вносились инвестиции (Тип B)
        C,//   Добавление нового участника системы (Тип С)
        D,//Исключение участника из системы (Тип D)
        E,//Управление системным токеном (Тип E)
        F//Управление wrap-токеном (Тип F)
    }
    enum votingStatus{
        waiting,
        accept,
        not_accept,
        deleted
    }
    struct Voting{
        votingStatus status;
        uint start_time;
        uint end_time;
        string description;
        uint count_yes;
        uint count_no;
        QuorumType quorum; //тип кворума
    }
    enum QuorumType{
        majority,//1 человек один голос , можно 51% и 49%(C,D,E,F)
        super_majority,// 1 человек один голос , но должна быть разница 67% и 33%(C,D,E,F)
        votes_by_count// зависит от кол-ва токенов(A,B)
    }
    enum VoiseType{
        none,
        Yes,
        No
    }
    event EventAddRegistration(address owner,string name,bool status);
    event EventPropose(ProposeType _category, uint _voting,string description,QuorumType _quorum);
    event EventDeletePropose(uint _idPropose);
    event EventQuorumMechanikBigCounter(uint _idPropose,bool variant);//эвент для обычного голосования
    event EventquarumMechanikSuperMajority(uint _idPropose,bool variant);
    event EventquorumMechanikVotesByCount(uint _idPropose,uint value, bool variant);
    event EventDelegate(uint proposeId,address _delegateToUser,uint amount);

    Propose[] public proposeActive;
    Propose[] public  History; // список типов предложений

    user[] public users; // список пользователей
    mapping (address => user) public usersMap;
    mapping (address => bool) public isDao; //Доделать

    mapping(address => mapping(uint => bool) ) public whoVoted; //КТО ПРОГОЛОСОВАЛ (хранит bool)
    mapping(uint => address[])  public votedWRP; //КТО ПРОГОЛОСОВАЛ ЗА СИСТЕМНЫЕ ТОКЕНЫ (НУЖНО ДЛЯ ВОЗВРАТ СРЕДСТ ПРИ ОТМЕНЕ ПРЕДЛОЖЕНИЯ)

    mapping (address => mapping(uint =>VoiseType )) public whoVoiceByPropoce; //КТО ЗА ЧТО ГОЛОСОВАЛ(0- none,1- true, 2-false )
    uint allPropoceCount;

    constructor(
        address profi,
        address rtk
    ) Governor("DAO") GovernorVotes(IVotes(profi)) GovernorVotesQuorumFraction(4){
            PROFi = ERC20(profi);
            RTK = ERC20(rtk);
    }
    modifier  onlyMajority(uint proposeId){
        require(proposeActive[proposeId].category == ProposeType.A|| proposeActive[proposeId].category == ProposeType.B,unicode"Не верная категория");
        _;
    }
    modifier onlyCount(uint proposeId){
            require(proposeActive[proposeId].category == ProposeType.C|| proposeActive[proposeId].category == ProposeType.D||proposeActive[proposeId].category == ProposeType.E||proposeActive[proposeId].category == ProposeType.F, unicode"Не верная категория");
        _;
    }
     function getAllProposals() public view returns (Propose[] memory) {
        return proposeActive;
    }
    function CheckMajority(uint proposeId) public { // для первого типа кворума
        uint realTime = block.timestamp;
        if (realTime >= proposeActive[proposeId].voting.end_time){
            if(proposeActive[proposeId].voting.count_yes >= proposeActive[proposeId].voting.count_no ){
            proposeActive[proposeId].voting.status = votingStatus.accept ;
            proposeActive[proposeId].isActive = false;
            }
            if(proposeActive[proposeId].voting.count_yes <= proposeActive[proposeId].voting.count_no ){
                proposeActive[proposeId].voting.status = votingStatus.not_accept;
                proposeActive[proposeId].isActive = false;
            }
            if(proposeActive[proposeId].voting.count_yes == proposeActive[proposeId].voting.count_no){
                proposeActive[proposeId].voting.status = votingStatus.deleted;
                proposeActive[proposeId].isActive = false;
            }
        }

    }
    function CheckSuperMajority(uint proposeId) public { // для второго типа кворума
        uint nowTime = block.timestamp;
        if(nowTime >= proposeActive[proposeId].voting.end_time){
            uint allVotes = proposeActive[proposeId].voting.count_yes + proposeActive[proposeId].voting.count_no;
            uint total = ((allVotes * 100) *67) /10000;
            if(proposeActive[proposeId].voting.count_yes >= total){
                proposeActive[proposeId].voting.status = votingStatus.accept ;
                proposeActive[proposeId].isActive = false;
            }
            if(proposeActive[proposeId].voting.count_no >= total){
                proposeActive[proposeId].voting.status = votingStatus.not_accept ;
                proposeActive[proposeId].isActive = false;
            }
            if(proposeActive[proposeId].voting.count_yes == proposeActive[proposeId].voting.count_no){
                proposeActive[proposeId].voting.status = votingStatus.deleted;
                proposeActive[proposeId].isActive = false;
            }

        }
    }
    function CheckCount (uint proposeId) public {// для третьего типа кворума
        uint realTime = block.timestamp;
        if (realTime >= proposeActive[proposeId].voting.end_time){
            if(proposeActive[proposeId].voting.count_yes >= proposeActive[proposeId].voting.count_no ){
                proposeActive[proposeId].voting.status = votingStatus.accept ;
                proposeActive[proposeId].isActive = false;
            }
            if(proposeActive[proposeId].voting.count_yes <= proposeActive[proposeId].voting.count_no ){
                proposeActive[proposeId].voting.status = votingStatus.not_accept;
                proposeActive[proposeId].isActive = false;
            }
            if(proposeActive[proposeId].voting.count_yes == proposeActive[proposeId].voting.count_no){
                proposeActive[proposeId].voting.status = votingStatus.deleted;
                proposeActive[proposeId].isActive = false;
            }
        }
    }
    function AddRegister(string memory name) public {
        require(usersMap[msg.sender].statys == false,unicode"ВЫ УЖЕ ЗАРЕГИСТРИРОВАННЫ");
        user memory newUser = user({owner:msg.sender,name: name,statys:true});
        usersMap[msg.sender] = newUser;
        users.push(usersMap[msg.sender]);
        emit EventAddRegistration(msg.sender,name,true);
    }

    function getAllUsers() public view returns ( user[] memory) {
        return users;
    }
    // function getAllProposals() public view returns(Propose[] memory){
    //     return proposeActive;
    // }
    function AddPropose(ProposeType _category, uint _voting,string memory description,QuorumType _quorum) public {
          if(_category == ProposeType.C || _category == ProposeType.D ||_category == ProposeType.E||_category == ProposeType.F){
             require(QuorumType.majority == _quorum||QuorumType.super_majority == _quorum,unicode"НЕВЕРНАЯ КАТЕГОРИЯ у propose");
          Voting memory newVoting = Voting(
            votingStatus.waiting,
            block.timestamp,
            block.timestamp + _voting,
            description,
            0,
            0,
            _quorum
        );
        Propose memory newPropose = Propose(
            allPropoceCount,
            _category,
            newVoting,
            msg.sender,
            true
        ); 
            proposeActive.push(newPropose);
            allPropoceCount =  allPropoceCount + 1; 
        }
        if(_category == ProposeType.A || _category == ProposeType.B){
           require(_quorum == QuorumType.votes_by_count,unicode"НЕВЕРНАЯ КАТЕГОРИЯ У propose");   
            Voting memory newVoting = Voting(
            votingStatus.waiting,
            block.timestamp,
            block.timestamp + _voting,
            description,
            0,
            0,
            _quorum
        );
        Propose memory newPropose = Propose(
            allPropoceCount,
            _category,
            newVoting,
            msg.sender,
            true
        ); 
            proposeActive.push(newPropose);
            allPropoceCount =  allPropoceCount + 1; 
        }
        emit EventPropose(_category, _voting, description, _quorum);
    }

    function deletePropose(uint _idPropose) public {
        require(msg.sender == proposeActive[_idPropose].owner,unicode"ТОЛЬКО ВЛАДЕЛЦ ПРЕДЛОЖЕНИЯ МОЖЕТ УДАЛЯТЬ ЕГО");
        proposeActive[_idPropose].voting.status = votingStatus.deleted;
        emit EventDeletePropose(_idPropose);
    }
    uint val = 1;
    function quorumMechanikBigCounter(uint _idPropose,bool variant) public onlyMajority(_idPropose) { //первый тип кворума
        require(false == whoVoted[msg.sender][_idPropose],unicode"ВЫ УЖЕ ГОЛОСОВАЛИ");
        require(false != proposeActive[_idPropose].isActive, unicode"ГОЛОСОВАНИЕ ОКОНЧЕННО");
        PROFi.transferFrom(msg.sender, address(this), val * ( 3 *(10**12)));
        if (variant == true){
            proposeActive[_idPropose].voting.count_yes = proposeActive[_idPropose].voting.count_yes + 1;
            whoVoted[msg.sender][_idPropose] = true;
            whoVoiceByPropoce[msg.sender][_idPropose] = VoiseType.Yes;
            CheckMajority(_idPropose);
        }
        if (variant == false){
            proposeActive[_idPropose].voting.count_no = proposeActive[_idPropose].voting.count_no +1;
            whoVoted[msg.sender][_idPropose] = true;
            whoVoiceByPropoce[msg.sender][_idPropose] = VoiseType.No;
            CheckMajority(_idPropose);
        }
        emit EventQuorumMechanikBigCounter(_idPropose,variant);
    }
    function quarumMechanikSuperMajority(uint _idPropose,bool variant) public onlyMajority(_idPropose) { //второй тип кворума
        require(false == whoVoted[msg.sender][_idPropose],unicode"ВЫ УЖЕ ГОЛОСОВАЛИ");
        require(false != proposeActive[_idPropose].isActive, unicode"ГОЛОСОВАНИЕ ОКОНЧЕННО");
        PROFi.transferFrom(msg.sender, address(this), val * ( 3 *(10**12)));
        if (variant == true){
            proposeActive[_idPropose].voting.count_yes = proposeActive[_idPropose].voting.count_yes + 1;
            whoVoted[msg.sender][_idPropose] = true;
            whoVoiceByPropoce[msg.sender][_idPropose] = VoiseType.Yes;
            CheckSuperMajority(_idPropose);
        }
        if (variant == false){
            proposeActive[_idPropose].voting.count_no = proposeActive[_idPropose].voting.count_no +1;
            whoVoted[msg.sender][_idPropose] = true;
            whoVoiceByPropoce[msg.sender][_idPropose] = VoiseType.No;
            CheckSuperMajority(_idPropose);
        }
        emit EventquarumMechanikSuperMajority(_idPropose,variant);
    }
    function quorumMechanikVotesByCount(uint _idPropose,uint value, bool variant) public onlyCount(_idPropose) { // третий тип кворума
        require(false == whoVoted[msg.sender][_idPropose],unicode"ВЫ УЖЕ ГОЛОСОВАЛИ");
        require(true == proposeActive[_idPropose].isActive);
            PROFi.transferFrom(msg.sender, address(this), value * ( 3 *(10**12)));
            if(variant == true){
                proposeActive[_idPropose].voting.count_yes = proposeActive[_idPropose].voting.count_yes + value;
                whoVoted[msg.sender][_idPropose] = true;
                whoVoiceByPropoce[msg.sender][_idPropose]= VoiseType.Yes;
                CheckCount(_idPropose);
            }
            if(variant == false){
                proposeActive[_idPropose].voting.count_no = proposeActive[_idPropose].voting.count_no + value;
                whoVoted[msg.sender][_idPropose] = true;
                whoVoiceByPropoce[msg.sender][_idPropose] = VoiseType.No;
                CheckCount(_idPropose);
            }
            emit EventquorumMechanikVotesByCount(_idPropose,value,variant);
    }

    function delegate(uint proposeId,address _delegateToUser,uint amount) public { 
        require(true == whoVoted[_delegateToUser][proposeId]);
        require(usersMap[msg.sender].statys == false, unicode"НЕДОСТУПНО ДЛЯ УЧАСТНИКА DAO");
        RTK.transferFrom(msg.sender,address(this),amount *(3* (10**11)));
        if(whoVoiceByPropoce[_delegateToUser][proposeId] == VoiseType.Yes){//ГОЛОС ЗА ДА
            proposeActive[proposeId].voting.count_yes = proposeActive[proposeId].voting.count_yes + amount;
        }
        if(whoVoiceByPropoce[_delegateToUser][proposeId] == VoiseType.No){//ГОЛОС ЗА НЕТ
            proposeActive[proposeId].voting.count_no = proposeActive[proposeId].voting.count_no + amount;
        }
        emit EventDelegate(proposeId,_delegateToUser,amount);
    }


    

    function votingDelay() public view virtual override returns (uint256) {
        //устанавливает через скоько будет голосование после создания предложения
        return 1 days;
    }

    function votingPeriod() public view virtual override returns (uint256) {
        //выставляет период голосования
        return 1 weeks;
    }
}