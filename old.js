
async function fetchHTML(url){
  //const { data } = await axios.get(url)
  //return cheerio.load(data)
  const data = await axios.get(url)
  return axios.get
}

async function getProxyAddresses(){
  let ipAddresses = [];
  let portNumbers = [];
  const data = await fetchHTML("https://www.proxy-list.download/api/v1/get?type=http&anon=elite")
  $("td:nth-child(1)").each(function(index, value) {
    ipAddresses[index] = $(this).text();
  });
  $("td:nth-child(2)").each(function(index, value) {
    portNumbers[index] = $(this).text();
  });

  //console.log(data)
  //console.log(ipAddresses.length)
  //console.log(portNumbers.length)
  //return _.zip(ipAddresses, portNumbers);
}
getProxyAddresses()
async function chooseProxy(){
  let randomNumber = Math.floor(Math.random() * 100);
  const proxyArray = await getProxyAddresses()
  return _.join(proxyArray[randomNumber], ':')
}

chooseProxy().then(address => {
  const host = 'www.chapo.chat';
  var proxy = `http://${address}`;
  console.log(proxy)
  //var options = url.parse(proxy)
  var agent = new HttpsProxyAgent(proxy);
  var ws = new WebSocket('wss://' + host + '/api/v1/ws', {agent: agent});
  //var ws = new WebSocket('wss://' + host + '/api/v1/ws');
  ws.on('open', () => {
    console.log('Connection succeed!');
    const names = ['SocDemPoster', 'SuccDemPoster', 'SuccDemPosting']
    for(i=0;i<3;i++){
      const name = names[i];
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
    }
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