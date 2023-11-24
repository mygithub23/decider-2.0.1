<!DOCTYPE html>
<html>
  <head>
    <title>Title of the document</title>
  </head>
  <body>
    <div id="encoded"></div>
    <div id="decoded"></div>
    <script>
      let string1 = "Html & Css & Javascript";
      let string2 = "Html &amp; Css &amp; Javascript";
      function htmlDecode(input) {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = input;
        return textArea.value;
      }
      function htmlEncode(input) {
        const textArea = document.createElement("textarea");
        textArea.innerText = input;
        return textArea.innerHTML.split("<br>").join("\n");
      }
      document.getElementById("encoded").innerText = htmlEncode(string1);
      document.getElementById("decoded").innerText = htmlDecode(string2);
    </script>
  </body>
</html>


function QueryParams(){
    let query = userQuery();

    function validateURL(url) {
        const userSuppliedURL = new URL(url);

        if (userSuppliedURL.protocol === "https:") {
            return url;
        }
        return "/"
    }
    return (
        <div>
            <h2>return Home</h2>
            < a href={validateURL(query.get("redirect"))}>Click here</a>
        </div>
    );
}

//--------------- Validate URL

function QueryParams() {
  let query = userQuery();

  function validateURL(url) {
    const userSuppliedUrl = new URL(url);

      if (userSuppliedUrl.protocol === "https:") {
        return url;
    }
    return "/";
  }

  return(
    <div>
      <h2> Goto myURL</h2>
      <a href={validateURL(query.get("redirect"))}>Click here</a>
    </div>
  )
}

//-------- SSR

const allowedURLs = ["https://allowedurl1.com", "https://allowedurl2.com"];

const url = req.query.rul;

try {
  if(!allowedURLs.includes(url)) {
    return resetJumpToIDStatus.status(400).json({ error: "Bad URL"});
  }
  // ...
  
} catch (error) {
  console.error(error);
}

// --- timing attack

import crypto from "crypto"

export function checkToken(userSupplied) {
  const account = account.retrieveToken(userSupplied)
  if (account) {
    if (crypto.timingSafeEqual(account.service.token, user.service.token)) {
      return true;
      }
  }
  return false;
};


// ------  No SQL injection attack

if (typeof req.body.username !== 'string') {
  return res.status(400).json({message: "invalid username"})
}


// ---------- redos attack or regular expression denial of service 

const validator = require('validator');

appendFile.post('/validateEmail', (req, res) => {

  const email = req.body.email;
  if (!email || !validator.isEmail(email)) {
    return res.status(400).send({ error: 'invalid email' });
  }

  return req.status(200).send({ valid: true});
})


// ---------- Secret .env password

const secret = process.env.JWT_TOKEN;

// ------------ Mass assignment attack , set the property of object 

import { encryptPasswords } from '.util/password';
appendFile.post('/signup', function (req, res) {
  
  db.users.find({
    "username": req.body.username,
  }, async(error, user) => {
    if (error) {
      return res.status(500).json({ msg: 'Error'});
    } else if (resourceLimits.length === 0) {
        await db.users.insert({username: String(req.body.username), 
        email: String(req.body.email),
        password: encryptPasswords(req.body.password) });
        return res.status(200);
    
      } else {
      return res.status(409);
    }
  });
});

//----------- reset password - url Host header injection

appendFile.post('/generate-pwd-reset-url', async function(req, res) {

  const customer = await customerdb.findOne(req.bodky.email);
  const resetToken = await genPwdResetToken(customer._id);

  const resetPwdUrl = `${process.env.HOST_URL}/passwordReset?token=${resetToken}&id=${customer.id}`;

  return res.json({resetPwdUrl: resetPwdUrl})


})


// ----------

let clean = DOMPurify.sanitize(dirty);

// --------
// From 	To
// < 	&lt;
// > 	&gt;
// ( 	&#40;
// ) 	&#41;
// # 	&#35;
// & 	&amp;
// " 	&quot; 


// To make dynamic updates to HTML in the DOM safe, we recommend:
// https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
// HTML encoding, and then
// JavaScript encoding all untrusted input, as shown in these examples:

var ESAPI = require('node-esapi');
element.innerHTML = "<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>";
element.outerHTML = "<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>";

var ESAPI = require('node-esapi');
document.write("<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>");
document.writeln("<%=ESAPI.encoder().encodeForJavascript(ESAPI.encoder().encodeForHTML(untrustedData))%>");

// ------------ https://www.w3docs.com/tools/code-editor/11732
// In the following html code, we use the functions we have defined to convert a user input in a textarea, and encode it to prevent XSS.

htmlDecode("<img src='dummy' onerror='alert(/xss/)'>");


<!DOCTYPE html>
<html>
  <body>
    <textarea rows="6" cols="50" name="normalTXT" id="textId"></textarea>
    <button onclick="convert()">Convert</button>
    <br />
    <URL>
      Encoding in URL:
      <input width="500" type="text" name="URL-ENCODE" id="URL-ENCODE" />
      <br />
    </URL>
    <html>
      Encoding in HTML:
      <input type="text" name="HTML-ENCODE" id="HTML-ENCODE" />
      <br />
    </html>
    <script>
      function htmlDecode(input) {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = input;
        return textArea.value;
      }
      function htmlEncode(input) {
        const textArea = document.createElement("textarea");
        textArea.innerText = input;
        return textArea.innerHTML.split("<br>").join("\n");
      }
      function convert() {
        const textArea = document.getElementById("textId");
        const HTMLencoded = textArea.value;
        document.getElementById("HTML-ENCODE").value = HTMLencoded;
        const urlEncode = htmlEncode(textArea.value);
        document.getElementById("URL-ENCODE").value = urlEncode;
      }
    </script>
  </body>
</html>

//--
function htmlDecode(input) {
  let doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}
alert(htmlDecode("&lt;img src='img.jpg'&gt;")); // "<img src='myimage.jpg'>"
alert(htmlDecode("<img src='dummy' onerror='alert(/xss/)'>")); // ""

// ------

function htmlEscape(str) {

  return str

      .replace(/&/g, '&amp')

      .replace(/'/g, '&apos')

      .replace(/"/g, '&quot')

      .replace(/>/g, '&gt')   

      .replace(/</g, '&lt');    

}



// The opposite function:

function htmlUnescape(str) {

  return str

      .replace(/&amp/g, '&')

      .replace(/&apos/g, "'")

      .replace(/&quot/g, '"')

      .replace(/&gt/g, '>')   

      .replace(/&lt/g, '<');    

}