const axios = require('axios');
const cheerio = require('cheerio');
const ProxyVerifier = require('proxy-verifier');
const ProxyLists = require('proxy-lists');
const fetch = require('node-fetch');
const url = require('url');
const _ = require('lodash');
const HttpsProxyAgent = require('https-proxy-agent');
const WebSocket = require('ws');
const hsolve = require('hsolve');
const randomWords = require('random-words');
const solveCaptcha = require('hcaptcha-solver');
const config = [];
let count = 0;
let proxyList = [];
let workingProxies = [];
let failedProxies = [];
const usedNames = [];
const names = ['SmartUser', 'TankieBernie', 'RedAOC', 'ItalianAOC', 'Zambino', 'princess8', 'RustyShackleford', 'michaeldonohue122', 'emily98', 'bbking12', 'jessica24', 'HamiltonFan', 'EcoSocialist33', 'ArrestedDevelopment', 'Darrel99', 'HoustonAstros', 'aaron01', 'AnarchoMarxistDude', 'terrencephillips'];


async function fetchHTML(url){
  const { data } = await axios.get(url)
  return cheerio.load(data)


}

async function getProxyAddresses(){
  let ipAddresses = [];
  let portNumbers = [];
  const data = await fetch('https://sslproxies.org/');
  const $ = cheerio.load(await data.text());
  $("td:nth-child(1)").each(function(index, value) {
    ipAddresses[index] = $(this).text();
  });
  $("td:nth-child(2)").each(function(index, value) {
    portNumbers[index] = $(this).text();
  });

  //console.log(data)
  //console.log(ipAddresses.length)
  //console.log(portNumbers.length)
  return _.zip(ipAddresses, portNumbers);
}
async function chooseProxy(){
  let randomNumber = Math.floor(Math.random() * 100);
  const proxyArray = await getProxyAddresses()
  return proxyArray[randomNumber]
}

chooseProxy.then(proxy => {

})
//runRegister()
function runRegister(){
chooseProxy().then(addressArray => {
  let options={
    host: addressArray[0],
    port: addressArray[1],
    headers: {
      UserAgent: 'Mozilla/5.0'
    }
  }
  const host = 'www.chapo.chat';
  //var proxy = `http://${address}`;
  //console.log(proxy)
  //var options = url.parse(proxy)
  var agent = new HttpsProxyAgent(options);
  console.log(`attempting connection to: ${options.host}:${options.port}`)
  var ws = new WebSocket('wss://' + host + '/api/v1/ws', {agent: agent});
  setTimeout(() => {
    if (ws.readyState !== 1) {
        console.log(`WS connection failed`)
        let proxyObject = workingProxies.pop()
        failedProxies.push(proxyObject)
        usedNames.map(name =>{
          usernames.push(name)
        })
          runRegister()
    }
 }, 20000);
  //var ws = new WebSocket('wss://' + host + '/api/v1/ws');
  ws.onerror = function(evt) {
    if (ws.readyState == 1) {
      console.log('ws normal error: ' + evt.type);
      let proxyObject = workingProxies.pop()
      failedProxies.push(proxyObject)
      usedNames.map(name =>{
        usernames.push(name)
      })
      runRegister()
    } else {
      console.log(evt)
      usedNames.map(name =>{
        usernames.push(name)
      })
      let proxyObject = workingProxies.pop()
      failedProxies.push(proxyObject)
      runRegister()
    }
  };
  ws.on('open', () => {
    console.log('Connection succeed!');
    const names = ['AbdullahMajid','wameltoe','YouCantSeeMe','NBhermit','jimmymcgill','tryandasawrus','mordecai2002','kateykateyson','JarlParks','freedomfries'];

    const name = 'AbdullahMajid'
    beatCaptcha().then(token => {
        let authUser = {username: name}
        console.log(token)
        config.push(authUser)
        return ws.send(JSON.stringify({
          op: 'Register',
          data: {
            admin: false,
            captcha_id: token,
            password: "B",
            password_verify: "B",
            pronouns: "they/them",
            show_nsfw: true,
            username: authUser.username
          }
        }));
      })
    ws.on('message', (msg) => {
      try {
        const res = JSON.parse(msg);
        console.log(res)
        switch (res.op) {
          case 'Register': {
            console.log(`made it to handleRegister`)
            console.log(res.data.jwt)
            let position = config.length-1
            config[position].auth = res.data.jwt
            return ws.send(JSON.stringify({
              op: 'UserJoin',
              data: {
                auth: config[position].auth
              }
            }));
          }
          case 'UserJoin': {
            return handleUserJoin(res.data);
          }
          default: {
            break;
          }
        }
      } catch (e) {
          console.error(e);
      }
    });
    //beatCaptcha();
  });
})
}

const beatCaptcha = async () => {
  try {
    const response = await solveCaptcha('https://www.chapo.chat/login');
    //console.log(response);
    return response;
    // F0_eyJ0eXAiOiJKV1Q...
  } catch (error) {
    console.log(error);
  }
}

const registerUser = (token) => {
  let words = randomWords({exactly: 3, maxLength: 8})
  let username = `${words.join('')}`
  count++;
  console.log(username)
  let authUser = {username: 'RedTankie'}
  console.log(token)
  config.push(authUser)
  ws.send(JSON.stringify({
    op: 'Register',
    data: {
      admin: false,
      captcha_id: token,
      password: "B",
      password_verify: "B",
      pronouns: "they/them",
      show_nsfw: true,
      username: authUser.username
    }
  }));
};

const userJoin = (jwt) => {
  console.log(`made it to userJoin`)
  let position = config.length-1
  config[position].auth = jwt
  ws.send(JSON.stringify({
    op: 'UserJoin',
    data: {
      auth: config[position].auth
    }
  }));
};

const handleRegister = (data) => {
  console.log(`made it to handleRegister`)
  console.log(data.jwt)
  userJoin(data.jwt)
}

const handleUserJoin = (data) => {
  console.log(`made it to handleUserJoin`)
  let position = config.length-1
  config[position].userId = data.user_id
  console.log(JSON.stringify(config[position])+'\n')
}


