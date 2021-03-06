import React from 'react'
import jwt from 'jsonwebtoken'
import {addUser, loginUser, getInfo, logOut, loginFB, getNewsUsr} from "../modules/auth";
import { IndexLink, Link, browserHistory } from 'react-router'
import validator from 'validator';


export class Auth extends React.Component {
    constructor (props) {
        super(props)
         this.state = {
            page: '',
             name: '',
             email: '',
             password: '',
             news: '',
             numPage: 0
             }
    }
    static authenticateUser(token) {
        localStorage.setItem('token', token);
    }
    static isUserAuthenticated() {
        return localStorage.getItem('token') !== null;
    }
    static deauthenticateUser() {
        localStorage.removeItem('token');
        let isLog = 'Sign up';
    }

    handleClickPages(pageNum) {
        this.setState({numPage: pageNum});
    }
    componentDidMount () {

    }

    componentWillMount () {
        if (this.props.location.query.jwtToken && !Auth.isUserAuthenticated()) {
            let decode = jwt.decode(this.props.location.query.jwtToken)
            localStorage.setItem('token', JSON.stringify(decode));
            location.reload();
        }
        if (this.props.location.query.author !== undefined)
        {
            this.props.getInfo(this.props.location.query.author);
            this.props.getNewsUsr(this.props.location.query.author);
        }
        else if(this.props.location.query.author === undefined && Auth.isUserAuthenticated())
        {

            let name = JSON.parse(localStorage.getItem('token'));
            name = name.name;
            this.props.getNewsUsr(name);
        }
    }
    handleChangeEmail (event) {
        //this.setState({ email: event.target.value })
    }
    handleChangePassword (event) {
        //this.setState({ password: event.target.value })
    }

    handleChange(type,event) {
        this.setState({[type]: event.target.value})
    }

    select(e) {
        this.setState({page: e});
    }

    registerUser (event) {
        event.preventDefault();
        if(validator.isEmail(this.state.email) !== true){
            alert('Email is invalid');
        }
        else{
        this.props.addUser(this.state);}
        this.render();
    }

    logUser (event) {
        event.preventDefault();
        this.props.loginUser(this.state);
        browserHistory.push('/auth');
        this.render();
        location.reload();
    }
    logout(event) {
        event.preventDefault();
        Auth.deauthenticateUser();
        this.setState({
            email: '',
            password: '',
        });
        browserHistory.push('/auth');
        localStorage.removeItem('news');
        this.render();
        location.reload();
    }

    pagination (numPages) {
        this.myArray=[];

        for(let i = 0; i<numPages; i++){
            if (this.state.numPage == i) { this.myArray.push(<a key={i}> <button
                className="pagination__btn pagination__btn_active" onClick={this.handleClickPages.bind(this, i)}>{i + 1}</button></a>) }
            else {
                this.myArray.push(<a key={i}> <button
                    className="pagination__btn" onClick={this.handleClickPages.bind(this, i)}>{i + 1}</button></a>)
            }
    }}

    render () {
        let userInfo;
        let isLoggedIn;
        let registerform, profile;
        //if(localStorage.getItem('userdata') !== null)
        if(this.props.location.query.author !== undefined)
        {
            userInfo = <Seluserinfo />;
            profile = <h1><span className="fa fa-lock"> Userprofile</span></h1>
        }
        else{
            let store = JSON.parse(localStorage.getItem('token'));

            let obj = {
                name: this.handleChange.bind(this, 'name'),
                email: this.handleChange.bind(this, 'email'),
                password: this.handleChange.bind(this, 'password'),
                reg: this.registerUser.bind(this),
                log: this.logUser.bind(this),
                logout: this.logout.bind(this),
                selectin: this.select.bind(this, 'login'),
                selectup: this.select.bind(this, 'signup')
            };
            if (Auth.isUserAuthenticated() === true) {
                userInfo = <Userinfo props={store} change={obj}/>;
                isLoggedIn = 'You are logged in';
                profile =  <h1><span className="fa fa-lock"> Your profile</span></h1>;
            }
            else if (Auth.isUserAuthenticated() === false) {
                userInfo = 'Login or signup';
                isLoggedIn = <Selectbtn props={obj}/>;
                profile =  <h1><span className="fa fa-lock"> Authentication</span></h1>;
            }
            else {
                //userInfo = 'Login or signup';
                userInfo = <Signuporlog/>;
                isLoggedIn = <Selectbtn props={obj}/>;
                profile =  <h1><span className="fa fa-lock"> Authentication</span></h1>
            }
            if (this.state.page === 'login') {
                registerform = <Registerform props={this.state} change={obj}/>;
            }
            else if (this.state.page === 'signup') {
                registerform = <Loginform props={this.state} change={obj}/>;
            }}
            let pages;
            let libraries;
            if(localStorage.getItem('news') !== null) {
                libraries = JSON.parse(localStorage.getItem('news'));
                if (libraries.length%3 == 0)
                {
                    pages = libraries.length/3;
                }
                else
                {
                    pages = Math.trunc(libraries.length/3) + 1;
                }
                let firstNews = this.state.numPage + 2 * this.state.numPage;
                let lastNews = firstNews + 3;
                libraries = libraries.slice(firstNews, lastNews);
            }
            else {libraries = [];}
            return (<div className="container">

                <div className="jumbotron text-center">
                    {/*<h1><span className="fa fa-lock"> Authentication</span></h1>*/}
                    {profile}
                    {isLoggedIn}
                    {userInfo}
                </div>
                {registerform}
                {libraries.map(function(news, index){
                    return <li  className="news__li2" key={index}>
                        <span><h1>{news.topic}</h1></span><br />
                        <span>{news.newstext}</span><br />
                        <span>Author: <Link to={`/auth?author=${news.author}`} >{news.author}</Link></span>
                        <span>Tags: {news.tags}</span>
                        <img src={news.file} />
                    </li>
                })}
                    <div className="pagination">{this.pagination(pages)}</div>
                    {this.myArray.map((itm)=>{return itm})}
            </div>)
        }
}

function Registerform(props) {
    return (
        <form className="add-news__form" onSubmit={props.change.reg} name="reguser">
                {/*<input value={props.props.username} onChange={props.change.username} name="author" placeholder="Write your name"/>*/}

                <input type="text" value={props.props.email} onChange={props.change.email} name="author" placeholder="Write your email" />

                <input type="text" value={props.props.name} onChange={props.change.name} name="author" placeholder="Write your name" />

                <input type="password" value={props.props.password} onChange={props.change.password} name="author" placeholder="Write your password" />

                <input type="submit" value="Finish registration"/>

            </form>
        )
}

function Loginform(props) {
    return(
        <form className="add-news__form" onSubmit={props.change.log} name="loginuser">
            <input type="text" onChange={props.change.email} name="author" placeholder="Write your email" />

            <input type="password" onChange={props.change.password} name="author" placeholder="Write your password" />

            <input type="submit" value="Login"/>
        </form>
    )
}

function Userinfo(props) {
    let email;
    if(props.props.email === undefined)
    {
        email = "User haven't got email";
    }
    else{ email = props.props.email}
    return(
        <div>
            <span>Name: {props.props.name}</span> <br />
            <span>Email: {email}</span> <br />
            <input type="button" value="Logout" onClick={props.change.logout} />
        </div>
    )
}

function Signuporlog(){
    return(
        <div> Login or signup</div>
    )
}

function Selectbtn (props) {
    return(<div>
                <p>Login or Register with:</p>
                <input type="submit" value="Sign up" onClick={props.props.selectin} />
                <input type="submit" value="Login" onClick={props.props.selectup}/>
            <a href='/users/login/facebook' className="btn btn-primary button__social center-block"> Facebook</a>
           </div>
);

}

 function Seluserinfo() {
    let data = JSON.parse(localStorage.getItem('userdata'));
    let libraries = JSON.parse(localStorage.getItem('news'));
    return(

        <div>
            <span>Name: {data.username}</span> <br />

            <span>Email: {data.email}</span> <br /> </div>)
        }


export default Auth
