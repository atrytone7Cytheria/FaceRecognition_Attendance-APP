//'use strict';

var authUser;
// Initializes the Demo.
const faceio = new faceIO("fioa82a3");
const loadType = 'stuattendance'

function Demo() {

  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  var SITE = 'iitk';

  var dropDownData;
  console.log("loading data here....");

  ui.start('#firebaseui-container', {
    'callbacks': {
      'signInSuccess': function (user, credential, redirectUrl) {
        //this.prototype.onAuthStateChanged(user);
        //Demo.prototype.onAuthStateChanged(user);
        console.log(' In in ui start callbacks, signInSuccess ....');
        //this.onAuthStateChanged(user);
        authUser = user;
        return false;
      }
    },
    signInOptions: [
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Other config options...
    'signInOptions': [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          type: 'image',
          size: 'invisible',
          badge: 'bottomleft'
        },
        defaultCountry: 'IN',
        defaultNationalNumber: '1234567890',
        loginHint: '+11234567890'
      }
    ],
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Shortcuts to DOM Elements.
    this.signOutButton = document.getElementById('demo-sign-out-button');
    this.submitButton = document.getElementById('submit-button');
    this.responseContainer = document.getElementById('demo-response');
    this.fullWidthContainer = document.getElementById('fullwidth');

    this.responseContainerCookie = document.getElementById('demo-response-cookie');
    this.fetchMenuItems = window.location.protocol + "//" + window.location.host + "/" + SITE + "/menu";
    this.myinfo = window.location.protocol + "//" + window.location.host + "/" + SITE + "/attendance";
    this.signedOutCard = document.getElementById('demo-signed-out-card');
    this.signedInCard = document.getElementById('demo-signed-in-card');
    this.menuDiv = document.getElementById('vhmenu');
    
  this.attendance = window.location.protocol + "//" + window.location.host+'/attendance'; 
  this.admin = window.location.protocol + "//" + window.location.host+'/admin'; 
  this.stuattendance = window.location.protocol + "//" + window.location.host+'/stuattendance'; 
    
  firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));


  }.bind(this));
}

Demo.prototype.oneStudentAttendance = async  function () {
  console.log("In oneStudentAttendance..................error code values:"+JSON.stringify(fioErrCode));
  try {
    await faceio.restartSession({});
    let response = await faceio.authenticate({
      locale: "auto",
    });

    console.log(` Unique Facial ID: ${response.facialId}
        PayLoad: ${JSON.stringify(response.payload)}
        `);

        const userInfo = {};
        
        let dateStr = new Date().toISOString().substring(0,19);
        userInfo[dateStr]= 'LOGGED_IN';
  
        console.log(` Unique Facial ID: ${response.facialId}
        Enrollment Date: ${response.timestamp}
        dateStr: ${userInfo}`
        // Gender: ${response.details.gender}
        // Age Approximation: ${response.details.age}`
      );
  
        console.log("^^^^^^^^^^^^ save the userInfo to DB:"+userInfo);
        firebase.database().ref('/AttendanceByfaceIds/' + response.facialId).update(userInfo).then(() => {
          console.log("User enrolled successfully, data saved in db facialID:"+response.facialId);
        });

        firebase.database().ref('/AttendanceLog/' + dateStr).update(response.facialId+"----LOGGED_IN").then(() => {
          console.log("User enrolled successfully, data saved in db facialID:"+response.facialId);
        });

      } catch (error) {
    console.log("handleLogin Error:"+error);
  }
}



Demo.prototype.enrolledStudentList = async function () {
  console.log("Encroll a student enrollOneStudentFormEnable............")
  document.getElementById("studentList").style.display = "block";
  const ref = firebase.database().ref('/Students/');
  ref.once('value').then(snap => {
    let stuListTable = `<h6>Click on 'roll number' to see attendance log</h6><table>   <tr>
    <th>Roll No</th>
    <th>Name</th>
    <th>Enrolled time</th>
    <th>FaceIO ID</th>
  </tr>`;

    snap.forEach(oneStudentObj => {
      console.log("&&&&&&&& oneStudnet: "+JSON.stringify(oneStudentObj));
      let oneStudent = JSON.parse(JSON.stringify(oneStudentObj));
      stuListTable += `<tr><td> 
         <a href="javascript:window.demo.OneStudentAttendanceLog('`+oneStudent.facialId +`','`+oneStudent.rollno+`', '` + oneStudent.name+`')">`+oneStudent.rollno+`</a>`   + `</td><td>` +oneStudent.name+ `</td><td>` + 
          oneStudent.enrollTime+`</td><td>` + oneStudent.facialId + `</td></tr>`;
    });
    stuListTable += `</table>`;
    // console.log("&&&&&&&& enrolled student list:"+ stuListTable);
    document.getElementById("enrollForm").style.display = "none";
    document.getElementById("studentList").innerHTML = stuListTable;
    return stuListTable;
  });

}

Demo.prototype.OneStudentAttendanceLog = async function (faceId, rollno, name) {
  console.log("In the  enrollOneStudentFormEnableOneStudentAttendanceLog............#" + faceId + "## rollno:" + rollno + ", name:" + name);
  let oneStudentLogHTML = "";
  oneStudentLogHTML = "<div> <h4>Attendance Log of " + name + "</h4>(roll no: " + rollno + ", Face ID:" + faceId + ")</div><br>"
  oneStudentLogHTML += `<table>   <tr>
        <th>Time Stamp</th>
        <th>IN or OUT</th>
        </tr>`;

  firebase.database().ref('/AttendanceByfaceIds/' + faceId.trim()).once('value').then(thisStuAttendance => {
    thisStuAttendance.forEach(oneEntry => {
      const oneStudentAttendanceEntry = JSON.parse(JSON.stringify(oneEntry));
      // console.log("this stu att:"+JSON.stringify(oneStudentAttendanceEntry)+", key:"+oneEntry.key)
      oneStudentLogHTML += `<tr><td>` + oneEntry.key + "" + `</td><td>` + oneEntry.val() + `</td></tr>`;
    })
    oneStudentLogHTML += `</table>`;
    // console.log("&&&&&&&& one student attt logg:"+ oneStudentLogHTML);
    document.getElementById("enrollForm").style.display = "none";
    document.getElementById("studentList").innerHTML = oneStudentLogHTML;
  });
}

Demo.prototype.enrollOneStudentFormEnable = async function () {
  console.log("Encroll a student enrollOneStudentFormEnable............")
  document.getElementById("enrollForm").style.display = "block";
  document.getElementById("studentList").style.display = "none";
}

Demo.prototype.enrollOneStudent = async function () {
  console.log("Encroll a student............")
    console.log("In handleEnrollXXXX..................error code values:"+JSON.stringify(fioErrCode));
    
    const stuname = document.getElementById("stuname").value;
    const sturollno = document.getElementById("rollno").value;
    console.log("&&&&&&&&&&&&& name:"+stuname+", rollno:"+sturollno);
    try {
      await faceio.restartSession({});
      let response = await faceio.enroll({
        locale: "auto",
        payload: {
          name: stuname,
          rollno: sturollno,
        },
      });
      
      const userInfo = {
        name: stuname,
        rollno: sturollno,
        facialId: response.facialId,
        enrollTime: response.timestamp
      }

      console.log(` Unique Facial ID: ${response.facialId}
      Enrollment Date: ${response.timestamp}
      Gender: ${response.details.gender}
      Age Approximation: ${response.details.age}`);

      console.log("^^^^^^^^^^^^ save the userInfo to DB:"+userInfo);
      firebase.database().ref('/Students/' + sturollno).set(userInfo).then(() => {
        console.log("User enrolled successfully, data saved in db:"+stuname+", facialID:"+response.facialId);
      });

      firebase.database().ref('/StuEnrollByFaceId/' + response.facialId).set(userInfo).then(() => {
        console.log("User enrolled successfully, data saved in facialID db:"+stuname+", facialID:"+response.facialId);
      });

    } catch (error) {
      console.log("handleEnroll Error:"+error);
    }
 
}

Demo.prototype.loadContent = function (loadType, params) {
  console.log('In loadContent load type=' + loadType);
  firebase.auth().currentUser.getIdToken().then(function (token) {
    //console.log('loadContent Sending request to', this.fetchMenuItems, 'with ID token in Authorization header.');
    var title = "My Home";
    var req = new XMLHttpRequest();
    req.onload = function () {
      // console.log("in onload of loadContent response text= "+req.responseText);
      // this.responseContainer.innerText = req.responseText;
      //  this.responseContainer.innerHTML = req.responseText;
      if (loadType != 'attendance' || loadType != 'admin' || loadType != 'stuattendance')
        this.fullWidthContainer.innerHTML = req.responseText;
      document.title = title;
    }.bind(this);
    req.onerror = function () {
      this.responseContainer.innerText = 'There was an error';
    }.bind(this);
    switch (loadType) {
      case "attendance":

        title = " Student attendance";
        console.log("in case for search student");

        req.open('GET', this.attendance); //" + usertype + "&print=" + print, true);
        break;
      //
      case "admin":
        title = " Student attendance Admin ";
        console.log("in case for Admin");

        req.open('GET', this.admin); //" + usertype + "&print=" + print, true);
        break;

      case "stuattendance":
        title = " Student Attendance ";
        console.log("in case for Student attenance");

        req.open('GET', this.stuattendance); //" + usertype + "&print=" + print, true);
        break;

      default:
        req.open('GET', this.admin, true);
        // console.log('Ok load default nothing.....or load basic user details TODO::::');
        break;
    }
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.send();
  }.bind(this));
};

// const faceio = new faceIO("fioa82a3");

async function enrollNewUser() {
  console.log("In handleEnroll..................error code values:"); //+JSON.stringify(fioErrCode));
  try {
    let response = await faceio.enroll({
      locale: "auto",
      payload: {
        email: "varshapillai2905@gmail.com",
        pin: "951234",
      },
    });

    console.log(` Unique Facial ID: ${response.facialId}
    Enrollment Date: ${response.timestamp}
    Gender: ${response.details.gender}
    Age Approximation: ${response.details.age}`);
  } catch (error) {
    console.log("handleEnroll Error:" + error);
  }
}
async function authenticateUser() {
  try {
    let response = await faceio.authenticate({
      locale: "auto",
    });

    console.log(` Unique Facial ID: ${response.facialId}
        PayLoad: ${JSON.stringify(response.payload)}
        `);
  } catch (error) {
    console.log("handleLogin Error:" + error);
  }
}
function handleError(errCode) {
  console.log("handleLogin Error:" + errorCode);
}

// Triggered on Firebase auth state change.
Demo.prototype.onAuthStateChanged = function (user) {
  console.log(' .....In onAuthStateChanged ....' + user);
  if (user) {
    //console.log('onAuthStateChanged: ....' + user.uid);
    authUser = user;
    this.signedOutCard.style.display = 'none';
    this.signedInCard.style.display = 'block';
    this.startFunctionsRequest();

   
    //----

    //Load page content:
    //console.log("111 onAuthStateChanged load page content......"+window.location.href);
    let urlRef = new URL(window.location.href);
    let params = new URLSearchParams(urlRef.search);
    let userId = params.get('user');
    let orderId = params.get('orderId');
    let load = params.get('load');
    //console.log("on load completed......"+userId+', orderId:'+orderId, );
    //console.log("..........ok let us load: "+ load);
    this.loadContent(load, params);
    //-------------End load page content


  } else {
    this.signedOutCard.style.display = 'block';
    this.signedInCard.style.display = 'none';
  }
};

// Initiates the sign-in flow using GoogleAuthProvider sign in in a popup.
Demo.prototype.signIn = function () {
  //firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  //var ui = new firebaseui.auth.AuthUI(firebase.auth());
};

// Signs-out of Firebase.
Demo.prototype.signOut = function () {
  firebase.auth().signOut();
  // clear the __session cookie
  document.cookie = '__session=';
  //window.location.href = "https://www.varshahostel.com";
};

// Does an authenticated request to a Firebase Functions endpoint using an Authorization header.
Demo.prototype.startFunctionsRequest = function () {
  firebase.auth().currentUser.getIdToken().then(function (token) {
    //console.log('Sending request to', this.fetchMenuItems, 'with ID token in Authorization header.');
    var req = new XMLHttpRequest();
    req.onload = function () {
      // this.responseContainer.innerText = req.responseText;
      //  this.responseContainer.innerHTML = req.responseText;
      this.menuDiv.innerHTML = req.responseText;
      document.getElementById("enrollForm").style.display = "none";
    }.bind(this);
    req.onerror = function () {
      this.responseContainer.innerText = 'There was an error';
    }.bind(this);
    req.open('GET', this.fetchMenuItems, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.send();
  }.bind(this));
};

// Load the demo.
window.demo = new Demo();