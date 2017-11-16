// validate emails on login. add general section/ prompt to provide email soln or schedule meeting. display consultant of the week. in-memory client side data storage is good for speed but terrible but things scale, n drains battery life.incentivise startups to help startups with points. fly startups and consultants to opposite places? improve footer.
// copy project to email to consultant feature. do referral code. implement schedules. fix page arrows wite blogs. back btn not working with load. read impact report of boston.masschallenge.org eg our startups are 3x more likely to survive or raise funding.  
// recommend yanju after post. view guides after consultant toggle. faq/debunk myths. discover startup types. 
//sade@uju.com apples
  
  //create refs
   var dbRefObj;
   var usersRef; var postsRef; 


   var allPosts = []; var userDets = {}, allCountries = {}, allIndustries = {}, allCategories = {}, allUsers = {}, orgs= {}, projectPages = [];
   var loggedIn = false;
   var user;
   var mode = 0; // 0 for add, key for other operations
   var mode2 = 0; //to represent orgId
   var wasConsultant = 0;

  //......................login begin
   var preObj = document.getElementById('object');
   var ulList= document.getElementById('list');
   var txtEmail= document.getElementById('txtEmail');
   var txtPassword= document.getElementById('txtPassword');
   var btnLogin= document.getElementById('btnLogin');
   var btnSignup= document.getElementById('btnSignup');
   var btnLogout= document.getElementById('btnLogout');
   var welcomeArea= document.getElementById('welcomeArea');
   var loginBox= document.getElementById('loginBox');

  //.....................decide if dev mode or prod

  var localhost = document.URL.toLowerCase().indexOf("local") > -1 || document.URL.toLowerCase().indexOf("127.0.") > -1;
     
$(document).ready(function(){

   //initialize email client
  (function(){
    emailjs.init("user_5PUNFbVzYsMnzkWcK8M0y");
  })();


  var config;

  if(localhost)
     config = {
      apiKey: "AIzaSyDFkzZsx-40x1Dv6Yg30ikF-vqaPosUhaQ",
      authDomain: "yanjudev.firebaseapp.com",
      databaseURL: "https://yanjudev.firebaseio.com",
      projectId: "yanjudev",
      storageBucket: "yanjudev.appspot.com",
      messagingSenderId: "474855126084"
     };
  else
     config = {
      apiKey: "AIzaSyBFOt3cT29Q4r-Bdb50XM-ekwDCEI9rc6c",
      authDomain: "yanju-4f91e.firebaseapp.com",
      databaseURL: "https://yanju-4f91e.firebaseio.com",
      storageBucket: "yanju-4f91e.appspot.com"
     };

  firebase.initializeApp(config);

  dbRefObj = firebase.database().ref().child('object');
  usersRef= dbRefObj.child('users');
  postsRef = dbRefObj.child('posts'); 

  btnLogout.addEventListener("click", function(){
    firebase.auth().signOut();
  });

 firebase.auth().onAuthStateChanged(function(firebaseUser){
   if(firebaseUser){
     loggedIn = true; 
     if(firebase.auth().currentUser){
        var isProfileUpdated = 0, myname = '', myemail = '';
        var userId = firebase.auth().currentUser.uid;

        usersRef.orderByChild("uid").equalTo(userId).once('value').then(function(s) {
          if(s.val() && s.val()[userId]){
            isProfileUpdated = s.val()[userId].profileUpdate;
            myname = s.val()[userId].name; myemail = s.val()[userId].email;
	    var rc="";
	    if(s.val()[userId].refercode) rc = s.val()[userId].refercode;
	    else   {
		 rc = s.val()[userId].email.split('@')[0] + s.val()[userId].email.split('@')[1].charAt(0);
		 usersRef.child(userId).update({ refercode: rc }); //save rc to db
	    }
          
            userDets = {
              name: myname, email: s.val()[userId].email, profileUpdate:isProfileUpdated, refercode:rc,
              uid:userId, origin: s.val()[userId].origin, school: s.val()[userId].school,
              pref1: s.val()[userId].pref1, pref2: s.val()[userId].pref2, pref3: s.val()[userId].pref3,
              pic: s.val()[userId].pic,  isConsultant: s.val()[userId].isConsultant, linkedin: s.val()[userId].linkedin, 
	      work: s.val()[userId].work, bio: s.val()[userId].bio, yanjureason: s.val()[userId].yanjureason, projectreason: s.val()[userId].projectreason
            };
            
      	    load('posts');
      	    loadAllPosts();
            welcomeArea.classList.remove('hide');

            welcomeArea.innerHTML= "<img id='welcomeImg' src='"+ userDets.pic + "' style='border-radius: 50%; width:20px; height:20px;'/> " + userDets.name;
            $("#referalCode").val(rc);

            if(!isProfileUpdated){
              var answer = confirm('Will you like to complete your user profile?');
              if(answer)
                load('updateProfile');
            } 

            console.log("Login successful "+userDets.name);      // what of creating sessions etc?
              
          }
        });        
      } else {var x = 1; }
  
      $('#txtEmail').addClass('hide');
      $('#txtPassword').addClass('hide');
      $('#btnLogin').addClass('hide');
      $('#btnSignup').addClass('hide');
      btnLogout.classList.remove('hide');

      txtPassword.value = "";
      txtEmail.value = "";
  } else{
      loggedIn = false;
      console.log('Not logged in');
      load('home');
      $('#txtEmail').removeClass('hide');
      $('#txtPassword').removeClass('hide');
      $('#btnLogin').removeClass('hide');
      $('#btnSignup').removeClass('hide');
      btnLogout.classList.add('hide');
      welcomeArea.classList.add('hide');
  }
 });

  firebase.database().ref('object/metric/consultants').on("value", function(snap){
      $('#metricB').html(snap.val());
  });

  firebase.database().ref('object/metric/solutions').on("value", function(snap){
      $('#metricA').html(snap.val());
  });

  postsRef.on("value", function(snapshot) {
      allPosts = snapshot.val();
    //  loadAllPosts();
  });

    firebase.database().ref('/object/generics/categories').once('value').then(function(snap){
      allCategories = snap.val(); 
      if(!snap.val() || snap.val().length < 1) 
        allCategories = generateCategoryList();
   });

   $( window ).resize(function() {
 	resizeBgImg();
   });

   resizeBgImg();
});

function scrollToHash(){
  if($(location.hash).offset())
    $('html,body').animate({
      'scrollTop': $(location.hash).offset().top
    }, 500);
}

function resizeBgImg(){
     var originalW = 610;
      var originalH = 317; 

      $("#bgimg").css("left", ""); $("#bgimg").css("height", ""); $("#bgimg").css("width", "");

      var winH = $(window).height(), winW = $(window).width();
      projectedW = winH/originalH * originalW;

      if(projectedW > winW) {    // set height to 100% & left to winW - projectedW;
         $("#bgimg").height("100%");

 	 var left;
	 if(winW < 520) left = winW - projectedW + 250;
	 else left = winW - projectedW;
	 $("#bgimg").css("left", left + "px")    
      }else $("#bgimg").width("100%"); // set img width to 100%
}

function login(){
	const em = $("#txtEmail").val();
	const p = $("#txtPassword").val();
	const auth = firebase.auth();

	auth.signInWithEmailAndPassword(em, p).then(function(user) {

  }, function(error) {
  	  	var errorCode = error.code;
      	var errorMessage = error.message;
      	if (errorCode === 'auth/wrong-password') {
        	   alert('Wrong password.');
      	} else {
        	   alert(errorMessage);
      	}
        	console.log(error);
   });
}

function signUp(){

  const n = document.getElementById('signName').value;
  const e = document.getElementById('signEmail').value;
  const p = document.getElementById('signPassword').value;
  const h = $("#howyouheard").val();
  const passC = document.getElementById('signPasswordCheck').value;
  const auth = firebase.auth();

  if(passC == p){
    auth.createUserWithEmailAndPassword(e, p).then(function(user) {
    alert("Signup successful. You are logged in now");   //for mobile use some 5s disappearing status bar

    var userId = firebase.auth().currentUser.uid; //try to push using key uid
    firebase.database().ref('object/users/'+userId).set({
         name: n, email: e, profileUpdate:0, uid: userId, hyh: h, pic:"https://firebasestorage.googleapis.com/v0/b/yanju-4f91e.appspot.com/o/images%2Fdummy.jpg?alt=media&token=d6ff2cd0-805e-4ce3-ac88-dea4f1022300"
          }); 

    load('home');
    }, function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode === 'auth/wrong-password') {
         alert('Wrong password.');
    } else {
         alert(errorMessage);
    }
      console.log(error);
    });
  } else { document.getElementById('errorMsg').innerHTML="Your passwords don't match";}
}

function resetPassword(){
   var email = '';
   if(userDets.email) email = userDets.email;
   else email = $("#txtEmail").val();

   firebase.auth().sendPasswordResetEmail(userDets.email).then(function() {
      alert("Check your email for password reset instructions.");
   }).catch(function(error) {
      console.log(error);
   });   

/*

var user = firebase.auth().currentUser;
var newPassword = getASecureRandomPassword();

user.updatePassword(newPassword).then(function() {
  // Update successful.
}, function(error) {
  // An error happened.
});

*/
}

function sendMail(description) {
  if(!localhost){
     emailjs.send("alextsado_gmail_com", "e_template_1", {"poster":userDets.name,"description":description})
     .then(function(response) {
        console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
     }, function(err) {
        console.log("FAILED. error=", err);
     });
  }
}

function createPost() {
  if(!loggedIn) {
    alert("Please signup or log in to add post");
  }else{

    var t = document.getElementById('title').value.trim();
    var d = document.getElementById('description').value.trim();
    var c = document.getElementById('category').value;
    var cN = document.getElementById('cName').value.trim();
    var e = document.getElementById('usrEmail').value.trim();
    var cm = document.getElementById('cMission').value.trim();
    var cw = document.getElementById('cWeb').value.trim();
    var cb = $("#cBac").val().trim();
    var i = $('#cIndustry').val().trim();
    var o = userDets.name; 
    var coun = $('#country option:selected').text().trim();
    var da;
    if(mode == 0) da = new Date().toGMTString();

    sendMail(d); // stop doing this when posts created are too many. only send in prod -> 200 a month limit

    var post = {title:t, description:d, category:c, cName:cN, email:e, owner:o, consultant:'', date:da, country: coun, cMission: cm, cWeb:cw, cIndustry:i, cBac:cb};

    if (t.length > 0 && d.length > 0 && cm.length > 0) {
      savePostToDb(post);
      clearForm();
      load('posts');
      loadAllPosts();
      alert('Post added');
    } else alert("Title, Description or Company Info are entered incorrectly");
  }
};

function clearForm(){
  document.getElementById('title').value = '';
  $('#category').val('Business Plan');
  $('#country').val(0)
  document.getElementById('description').value = '';
  document.getElementById('cName').value = '';
  document.getElementById('usrEmail').value = '';
  $('#cIndustry').val('');
}

function savePostToDb(post){ 

  if(mode == 0){
    var id = postsRef.push().key, orgIdvar;

     firebase.database().ref('/object/orgs').once('value').then(function(snap){
        orgs = snap.val(); var oldOrg = 0;

        for(var key in orgs){
 	   if(orgs[key].cName.toLowerCase() == post.cName.toLowerCase()){
	      oldOrg = 1; orgIdvar = key;
       	      firebase.database().ref('object/orgs/'+ key+ '/numProjs').transaction(function(number) {
                 return (number || 0) + 1;
       	      }); 
	   }
        } 

	if(oldOrg == 0){
	   orgIdvar = firebase.database().ref('object/orgs').push().key;
	   firebase.database().ref('object/orgs/'+orgIdvar).update({     		
              cName:post.cName, country: post.country, cMission: post.cMission, cWeb: post.cWeb, numProjs: 1, cIndustry:post.cIndustry, cBac: post.cBac, orgId: orgIdvar
           });
	}

        firebase.database().ref('object/posts/'+id).update({		
           title:post.title, description:post.description, category:post.category, cName:post.cName, email:post.email, owner:post.owner, consultant:"", date:post.date, country: post.country, cMission: post.cMission, cWeb: post.cWeb, cIndustry: post.cIndustry, cBac: post.cBac, orgId: orgIdvar,
        });
     });

  }else{  //mode == key   //use another key
    postsRef.child(mode).update({    
        title:post.title, description:post.description, category:post.category, cName:post.cName, email:post.email, owner:post.owner, country: post.country, cMission: post.cMission, cWeb: post.cWeb, cIndustry: post.cIndustry, cBac: post.cBac,
    });

    firebase.database().ref('object/orgs/'+mode2).update({     		
        cName:post.cName, country: post.country, cMission: post.cMission, cWeb: post.cWeb, cIndustry: post.cIndustry, cBac: post.cBac,
    });
    mode = 0; mode2= 0;
  }
}

function uploadReport(){
   //save to firebase storage. then save reference to org in firedb (can be multiple). then increment consultant completed projects. 
   //then mark proj complete to prevent further appearance in main pg. then send email to proj owner with report (whip up consultant email client). 

   firebase.database().ref('object/users/'+ userDets.uid + '/completedProjects').transaction(function(number) {
	number = (number || 0) + 1;
	userDets.completedProjects = number;
       return number;
   }); 
}

function refreshUI(list){
  var lis = '', factor = 6;

  lis = lis + '<div id="postsBox">';

  if(list.length == 0) lis = '<p class="groove postlist cell" style="color:red">No posts found</p>';  

  lis = lis + '<div id="postItems" style="display:flex; flex-flow: wrap; justify-content:space-around;"></div>';
  lis = lis + '</div>';

  lis = lis + '<br/><br/><div class="pagination">';
  lis = lis + '<a href="#" onclick="">&laquo;</a>';
  for (var i = 1; i < Math.ceil(list.length/factor)+1; i++) {
     lis = lis + '<a href="#postsSection" class="pages" id="p'+ i +'" onclick="getPostGroup('+ i +')">'+ i +'</a>';
  } 
  lis = lis + '<a href="#" onclick="">&laquo;</a></div><br/>';

  $('#posts').html(lis); 

  if(list.length > 0) {
    createProjectPages(factor, list);
    getPostGroup(1);
  }
}

function createProjectPages(factor, list){ 
  var start, end, count = 1;
  var continu = 0, page;
  projectPosts = [];

  while(continu < list.length){     
     start = continu; page=''; 
     if(factor*count > list.length) end = list.length;
     else end = factor*count; 
     count++;

     for(var i = start; i < end; i++){  
	page += '<div class="postItem" data-key="' + list[i].key + '">' + genPosts2(list[i], list[i].key) + '</div>';
     }
     continu = continu + factor;
     projectPosts.push(page);
  }
}

function getPostGroup(group){
   $('#p'+ group).addClass('active');
    $('#p'+ group).siblings().each(function(){
        $(this).removeClass('active');    
    });


   $("#postItems").html(projectPosts[group-1]);
}

function refreshUI2(list) {
  var lis = '';
  for (var i = 0; i < list.length; i++) {
    lis += '<div data-key="' + list[i].key + '">' + genPosts(list[i]) + '</div>';
  };

  if(list.length == 0) lis = '<p class="groove postlist cell" style="color:red">No projects found. Log in to view more</p>';
  document.getElementById('posts').innerHTML = lis;
};

function genPosts2(list, key){
  var weblink = list.cWeb;
  if(weblink && weblink.indexOf('http') == -1 ) weblink = 'http://' + weblink;

  var txt = '';

  txt = txt + '<p class="postLabel">'+ list.category + '</p>';  
  txt = txt + '<p class="postItemHeader">' + list.title + '</p>';  
  txt = txt + '<b>Organization: </b><a href="'+ weblink +'" target="_blank">' + list.cName + '</a><br/>';  
  txt = txt + '<b>Mission: </b>'+ list.cMission + '<br/>';  
  txt = txt + '<b>Country: </b>'+ list.country + '<br/>';  
  txt = txt + '<a href="#" style="float:right;" onclick="load2('+ "'projectpg'" +', \''+ key +'\')"> Details</a> ';

  return txt;
}

function genPosts(list) { 
  var links = '';
  links += '<div class="groove postlist cell"><h1>' +list.title+ '</h1> by '+ list.cName+ ', '+ list.country +' <br>';
  links += '<i>' +list.category+ '</i> '+ list.date + '<br><br>' ;
  links += '<b>Owner: </b>'+ list.owner + ' <br>';
  links += '<b>Details: </b>' +list.description;

  if(list.consultant && list.consultant.length > 0)  links += '<br><b>' +list.consultant + '</b> is the Consultant who solved this case';

  if(userDets.name && (userDets.name.toLowerCase() == list.owner.toLowerCase())){
    links += '<br><a href="javascript:edit(\'' + list.key + '\',\'' + list.title + '\')">Edit</a> | ';
    links += '<a href="javascript:del(\'' + list.key + '\',\'' + list.title + '\')">Delete</a> | ';
    if(list.consultant && list.consultant.length > 0)
      links += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + list.key + '\')">Edit completion details</a></div>';    
    else links += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + list.key + '\')">Mark as complete</a></div>';    
  } else {
      links += '<br><button onclick="javascript:window.location.href =\'mailto:' + list.email +'?subject=Follow up on your Yanju Post '+ list.title +' &body= <b>Details: </b>' + list.description +
           ' <br/> <b>Short Bio:</b> '+ userDets.bio +' <br/> <b>Response:</b> ;\'">Send Email to consult</button>  '+
	   '<button onclick="uploadReport()">Upload Report</button>';
      //use user.emailVerified to know if you should send email

  }

  return links;
};

function edit(key, title) {
  mode = key;
  load('edit');
}
   
function del(key, title) {
  var response = confirm("Are certain about removing \"" + title + "\" from the list?");
  if (response == true) {
      postsRef.child(key).remove();
  }
}

function displayLogin(){
  document.getElementById('loginModal').style.display = "block"; 
}

function displaySignup(){
  closeLogin();
  document.getElementById('signupModal').style.display = "block"; 
}

function closeLogin(){
  document.getElementById('loginModal').style.display = "none";
}

function closeSignup(){
  document.getElementById('signupModal').style.display = "none";
}

function markComplete(key){
  document.getElementById('markCompleteModal').style.display = "block"; 
  document.getElementById('key').value= key;  
  document.getElementById('ratingVal').value = document.getElementById('rating').value;
}

function completePost(){
  var c = document.getElementById('consultant').value;
  var r = document.getElementById('rating').value;
  var s = document.getElementById('solution').value;  

  var k = document.getElementById('key').value; 

  if(c.length > 0){
    firebase.database().ref('object/posts/'+ k).update({ 
      consultant: c, rating: r, solution: s, isComplete: 1
    });
    /*
    firebase.database().ref('object/metric/solutions').transaction(function(solutions) {
       return (solutions || 0) + 1;
    });  */
  }

  closeMarkComplete();
}  

function closeMarkComplete(){
  document.getElementById('markCompleteModal').style.display = "none";
  document.getElementById('consultant').value = "";
  document.getElementById('solution').value = "";
}

function printValue(slider, input){
  document.getElementById(input).value = document.getElementById(slider).value; 
}


function updateProfile(){
    	    
    userDets.name = $("#signName").val(); 
    userDets.email = $("#signEmail").val(); 
    userDets.linkedin = $("#plinkedin").val(); 
    userDets.origin = $("#origin").val(); 
    userDets.school = $("#school").val();
    userDets.work = $("#work").val();
    userDets.bio = $("#bio").val();
    userDets.yanjureason = $("#yanjureason").val();
    userDets.projectreason = $("#projectreason").val();

    if($('#consultantToggle').is(':checked')){
      userDets.pref1 = $("#pref1").val(); 
      userDets.pref2 = $("#pref2").val(); 
      userDets.pref3 = $("#pref3").val(); 
      userDets.isConsultant = 1;
      if(wasConsultant == 0)
        firebase.database().ref('object/metric/consultants').transaction(function(consultants) {
 	   return (consultants || 0) + 1;
	}); 
    } else {
      userDets.isConsultant = 0;
      if(wasConsultant == 1)
        firebase.database().ref('object/metric/consultants').transaction(function(consultants) {
 	   return (consultants || 0) - 1;
	});
    }

    if(userDets.profileUpdate == 0) userDets.profileUpdate = 1;

    firebase.database().ref('object/users/'+userDets.uid).update({
        name: userDets.name, email: userDets.email, profileUpdate:1, 
	origin: userDets.origin, school: userDets.school, pref1: userDets.pref1, 
        pref2: userDets.pref2, pref3: userDets.pref3, isConsultant: userDets.isConsultant, linkedin: userDets.linkedin, 
        work: userDets.work, bio: userDets.bio, projectreason: userDets.projectreason, yanjureason: userDets.yanjureason 
    }); 
  
    $('welcomeImg').attr('src', userDets.pic);	 
    load('profile');
}

function searchPosts() { //switch to define list before loadallposts then use list and not allposts here
 var text = document.getElementById('searchText').value.trim().toLowerCase();
 var filter = document.getElementById('searchCtr').value.trim();
 var newList= [];
 var add = false;

 for(var key in allPosts) {
   if(filter == 'title' && allPosts[key].isComplete != 1){
     if (allPosts.hasOwnProperty(key) && allPosts[key].title && allPosts[key].title.toLowerCase().indexOf(text.toLowerCase()) > -1) add = true;   
   } else if(filter == 'cName' && allPosts[key].isComplete != 1){
      if (allPosts.hasOwnProperty(key) && allPosts[key].cName && allPosts[key].cName.toLowerCase().indexOf(text.toLowerCase()) > -1) add = true;   
   } else if(filter == 'category' && allPosts[key].isComplete != 1){
      if (allPosts.hasOwnProperty(key) && allPosts[key].category && allPosts[key].category.toLowerCase().indexOf(text.toLowerCase()) > -1) add = true;   
   } else if(filter == 'industry' && allPosts[key].isComplete != 1){
      if (allPosts.hasOwnProperty(key) && allPosts[key].cIndustry && allPosts[key].cIndustry.toLowerCase().indexOf(text.toLowerCase()) > -1) add = true;   
   } 

   if(add) {
      newList.push({
        description: allPosts[key].description ? allPosts[key].description : '',
        title: allPosts[key].title ? allPosts[key].title : '',
        cName: allPosts[key].cName ? allPosts[key].cName : '',
        cMission: allPosts[key].cMission ? allPosts[key].cMission : '',
        cWeb: allPosts[key].cWeb ? allPosts[key].cWeb : '',
        cBac: allPosts[key].cBac ? allPosts[key].cBac : '',
        cIndustry: allPosts[key].cIndustry ? allPosts[key].cIndustry : '',
        category: allPosts[key].category ? allPosts[key].category : '',
        email: allPosts[key].email ? allPosts[key].email : '',
        owner: allPosts[key].owner ? allPosts[key].owner : '',
        orgId: allPosts[key].orgId ? allPosts[key].orgId : '',
        date: allPosts[key].date ? allPosts[key].date : '',
        country: allPosts[key].country ? allPosts[key].country : '',
        consultant: allPosts[key].consultant ? allPosts[key].consultant : '',
                    key: key
      })  
      add = false;
   }
    
 }

  refreshUI(newList.reverse());

}

function loadAllPosts(){
  var list = [];

  for (var key in allPosts) {
    if (allPosts.hasOwnProperty(key)) {
      var t = allPosts[key].title ? allPosts[key].title : '';
      var d = allPosts[key].description ? allPosts[key].description : '';
      var c = allPosts[key].category ? allPosts[key].category : '';
      var cN = allPosts[key].cName ? allPosts[key].cName : '';
      var cM = allPosts[key].cMission ? allPosts[key].cMission : '';
      var cW = allPosts[key].cWeb ? allPosts[key].cWeb : '';
      var i = allPosts[key].cIndustry ? allPosts[key].cIndustry : '';
      var cB = allPosts[key].cBac ? allPosts[key].cBac : '';
      var e = allPosts[key].email ? allPosts[key].email : '';
      var o = allPosts[key].owner ? allPosts[key].owner : '';
      var oi = allPosts[key].orgId ? allPosts[key].orgId : '';
      var coun = allPosts[key].country ? allPosts[key].country : '';
      var da = allPosts[key].date ? allPosts[key].date : '';
      var con = allPosts[key].consultant ? allPosts[key].consultant : '';

      if (t.trim().length > 0) {
        list.push({
          description: d,
          title: t,
          cName: cN,
	  cMission: cM,
	  cWeb: cW,
	  cBac: cB,
	  cIndustry: i,
          category: c,
          email: e,
          owner: o,
          orgId: oi,
          date: da,
          consultant: con,
          country: coun,
          key: key
        })
      }
    }
  }

  refreshUI(list.reverse());
}

function loadMyPosts(){ 
  var newList= [];
  var add = false;

  for(var key in allPosts) {
    if (allPosts.hasOwnProperty(key) && allPosts[key].owner && allPosts[key].owner.toLowerCase().indexOf(userDets.name.toLowerCase()) > -1) {
      newList.push({
        description: allPosts[key].description ? allPosts[key].description : '',
        title: allPosts[key].title ? allPosts[key].title : '',
        cName: allPosts[key].cName ? allPosts[key].cName : '',
        cMission: allPosts[key].cMission ? allPosts[key].cMission : '',
        cWeb: allPosts[key].cWeb ? allPosts[key].cWeb : '',
        cBac: allPosts[key].cBac ? allPosts[key].cBac : '',
        cIndustry: allPosts[key].cIndustry ? allPosts[key].cIndustry : '',
        category: allPosts[key].category ? allPosts[key].category : '',
        email: allPosts[key].email ? allPosts[key].email : '',
        owner: allPosts[key].owner ? allPosts[key].owner : '',
        orgId: allPosts[key].orgId ? allPosts[key].orgId : '',
        date: allPosts[key].date ? allPosts[key].date : '',
        country: allPosts[key].country ? allPosts[key].country : '',
        consultant: allPosts[key].consultant ? allPosts[key].consultant : '',
        key: key
      })
    }       
 }

  refreshUI(newList.reverse());
}

function generateCategoryList(){ 

   var c = {'Business Plan':'Business Plan', 'Data Analytics':'Data Analytics', 'Finance or Accounting':'Finance or Accounting', 'Market Plan or Strategy':'Market Plan or Strategy',
             'Hiring Strategy':'Hiring Strategy', 'Pitch Deck':'Pitch Deck', 'Operations':'Operations',
             'Social or Digital marketing':'Social or Digital Marketing', 'Software':'Software', 'Other':'Other' };

   firebase.database().ref('/object/generics/').update({
      categories: c
   });

   return c;
}

function generateIndustryList(){ 

   var i = {'Agribusiness': 'Agribusiness', 'Beauty':'Beauty', 'Consulting':'Consulting', 'Education':'Education', 'Enterprise Solutions': 'Enterprise Solutions', 'Entertainment': 'Entertainment', 
       'Finance':'Finance', 'Fintech':'FinTech', 'Health':'Health', 'Manufacturing':'Manufacturing', 'Marketing': 'Marketing', 'Marketplace':'Marketplace', 
       'Recruiting': 'Recruiting', 'Other technology':'Other Technology', 'Other':'Other' };

   firebase.database().ref('/object/generics/').update({
      industries: i
   });

   return i;
}

function generateCountryList(){

   var c = {'Algeria': 'Algeria', 'Angola': 'Angola', 'Benin': 'Benin', 'Botswana': 'Botswana',
        'Burkina Faso': 'Burkina Faso', 'Burundi': 'Burundi', 'Cape Verde': 'Cape Verde', 
        'Cameroun': 'Cameroun', 'Central African Republic': 'Central African Republic', 'Chad': 'Chad', 
  	'Comoros': 'Comoros', 'Congo': 'Congo', "Cote D'Ivoire": "Cote D'Ivoire", 'Djibouti': 'Djibouti', 
 	'Egypt': 'Egypt', 'Equatorial Guinea': 'Equatorial Guinea', 'Eritrea': 'Eritrea', 
 	'Ethiopia': 'Ethiopia', 'Gabon': 'Gabon', 'Gambia': 'Gambia', 'Ghana': 'Ghana', 
	'Guinea': 'Guinea', 'Guinea-Bissau': 'Guinea-Bissau', 'Kenya': 'Kenya', 'Lesotho': 'Lesotho', 
	'Liberia': 'Liberia', 'Libya': 'Libya', 'Madagascar': 'Madagascar', 'Malawi': 'Malawi', 
	'Mali': 'Mali', 'Mauritania': 'Mauritania', 'Mauritius': 'Mauritius', 'Morocco': 'Morocco', 
	'Mozambique': 'Mozambique', 'Namibia': 'Namibia', 'Niger': 'Niger', 'Nigeria': 'Nigeria', 
        'Rwanda': 'Rwanda', 'Sao Tome': 'Sao Tome', 'Senegal': 'Senegal', 'Seychelles': 'Seychelles', 
	'Sierra Leone': 'Sierra Leone', 'Somalia': 'Somalia', 'South Africa': 'South Africa', 
        'South Sudan': 'South Sudan', 'Sudan': 'Sudan', 'Swaziland': 'Swaziland', 'Tanzania': 'Tanzania', 
	'Togo': 'Togo', 'Tunisia': 'Tunisia', 'Uganda': 'Uganda', 'Zambia': 'Zambia', 'Zimbabwe' :'Zimbabwe' 
   };

   firebase.database().ref('/object/generics/').update({
      countries: c
   });

   return c;
}

function populateCountries(){
 
  $country = $("select[name='country']");

  if(allCountries.hasOwnProperty('Algeria'))
    for(var key in allCountries)
      $("<option value='"+ key +"'>"+ allCountries[key] + "</option>").appendTo($country);
  else {     
    firebase.database().ref('/object/generics/countries').once('value').then(function(snap){
      allCountries = snap.val(); 
      if(!snap.val() || snap.val().length < 1) 
        allCountries = generateCountryList();

      for(var key in allCountries)
        $("<option value='"+ key +"'>"+ allCountries[key] + "</option>").appendTo($country);
    });
  }
}

function populateIndustries(){
 
  $industry = $("select[name='cIndustry']");

  if(allIndustries.hasOwnProperty('Finance'))
    for(var key in allIndustries)
      $("<option value='"+ key +"'>"+ allIndustries[key] + "</option>").appendTo($industry);
  else {     
    firebase.database().ref('/object/generics/industries').once('value').then(function(snap){
      allIndustries = snap.val(); 
      if(!snap.val() || snap.val().length < 1) 
        allIndustries = generateIndustryList();

      for(var key in allIndustries)
        $("<option value='"+ key +"'>"+ allIndustries[key] + "</option>").appendTo($industry);
    });
  }
}

function populateCategories(optionId){
//  $c = $("select[name='category']");
  $c = $("select[name='"+ optionId +"']");

  if(allCategories.hasOwnProperty('Business Plan'))
    for(var key in allCategories)
      $("<option value='"+ key +"'>"+ allCategories[key] + "</option>").appendTo($c);
  else {     
    firebase.database().ref('/object/generics/categories').once('value').then(function(snap){
      allCategories = snap.val(); 
      if(!snap.val() || snap.val().length < 1) 
        allCategories = generateCategoryList();

      for(var key in allCategories)
        $("<option value='"+ key +"'>"+ allCategories[key] + "</option>").appendTo($c);
    });
  } 
}

function addConsultantBlock(consultant){
  var block = ""; var img = new Image(), imgsrc, w='', h='', l='', t='';

  if(consultant){
    img.src = consultant.pic; 
    if(consultant.pic) imgsrc = consultant.pic; 
    else imgsrc = "imgs/dummy.jpg";

    if(img.width > img.height){
	h = "250px";
	w = "", t = "";
	l = "-" + (250/img.height * img.width - 250)/2 + "px";
    }else {
	w = "250px";
 	
    }

    block = '<div style=" background-color:darkslategray; padding-bottom: 10px; margin-right:20px; margin-bottom:20px; overflow:hidden; width:250px; border-radius:1px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">'+
	'<div style="height:250px; overflow:hidden;"><img src="'+ imgsrc +'" alt="Image not uploaded yet" style="position:relative; width:'+ w +'; height: '+ h +'; top: '+ t +'; left:'+ l +';" /></div></br>'+
	'<center><b>'+ consultant.name +'</b><br/><em>'+consultant.school+'</em></br><a href="mailto:' + consultant.email +'?subject=Yanju%20Consultant%20Outreach;"> contact </a></center>'+
     '</div>';

/* //   block = '<a href="#" class="list-group-item" onclick="loadActiveConsultant(\''+consultant.uid +'\')">'+
  block =  '<table style="margin-bottom:15px;"><tr id="consultantTr" style="height:150px; border-bottom:.5px double lightgray;"><td>'+
        '<div id="cDiv" style="overflow:hidden; height:150px;"><img id="cPic" src="'+ consultant.pic +'" alt="Image not uploaded yet" style=" margin-right:10px; width:150px; "/></div>'+
        '</td><td id="cDets" style="">'+
              '<h4 class="list-group-item-heading">'+ consultant.name +'</h4>'+
              '<p class="list-group-item-text">'+
    '<b>Affiliation:</b> '+consultant.school+' </br>'+
    '<b>Expertise:</b> '+ consultant.pref1 + ', ' + consultant.pref2 + ', ' + consultant.pref3 +' </br>'+
    '<b>Email:</b> <a href="mailto:' + consultant.email +'?subject=Yanju%20Consultant%20Outreach;"> contact </a> </br>' +
    '<b>Bio:</b> '+consultant.bio+' </br>'+
    '<b>Yanju points:</b> 50'+  
        '</p></td></tr></table>';
      //      '</a> '; */
  }

  return block;
}

function loadActiveConsultant(key){
  var block = "";

  block = '<center><img src="'+ allUsers[key].pic +'" alt="Image not uploaded yet" style="width:250px;"/><br/><br/>' +
    '<b>Name:</b> '+ allUsers[key].name +' </br>' +
    '<b>Affiliation:</b> '+ allUsers[key].school +' </br>' +
    '<b>Expertise:</b> '+ allUsers[key].pref1 +', '+ allUsers[key].pref2 +', '+ allUsers[key].pref3 + ' </br>'+
    '<b>Email:</b> ' + '<a href="mailto:' + allUsers[key].email +'?subject=Yanju%20Consultant%20Outreach;"> contact </a>' +' </br>' +
    '<b>Yanju points:</b> 50  ';

  $("#consultantActive").html(block);
}


function addOrgBlock(org){
  var block = ""; var img = new Image();

  if(org){
    var weblink = org.cWeb;
    if(weblink && weblink.indexOf('http') == -1 ) weblink = 'http://' + weblink;

 //   block = '<a href="#" class="list-group-item" onclick="loadActiveOrg(\''+org.uid +'\')">'+
   block =     '<table style="border: .5px lightgray solid; width:100%;"><tr><td style="width:90%; padding:20px;">'+
              '<h4 class="list-group-item-heading"><b>'+ org.cName +'</b></h4>'+
              '<p class="list-group-item-text">'+
    '<b>Industry:</b> '+ org.cIndustry +' </br>'+
    '<b>Country:</b> '+ org.country +' </br>'+
    '<b>Mission:</b> '+ org.cMission +' </br>'+
    '<b>Website:</b> <a href="'+ weblink +'"target="_blank">link</a> </br>'+
    '<b>Number of Projects:</b> '+ org.numProjs +  
        '</p></td></tr></table>';
      //      '</a> ';
  }

  return block;
}

function loadActiveOrg(key){
  var block = "";

  var weblink = orgs[key].cWeb;
  if(weblink && weblink.indexOf('http') == -1 ) weblink = 'http://' + weblink;

  block = '<b>Name:</b> '+ orgs[key].cName +' </br>' +
    '<b>Industry:</b> '+ orgs[key].cIndustry +' </br>'+
    '<b>Country:</b> '+ orgs[key].country +' </br>'+
    '<b>Mission:</b> '+ orgs[key].cMission +' </br>'+
    '<b>Website:</b> '+ weblink +' </br>'+
    '<b>Number of Projects:</b> '+ orgs[key].numProjs;

  $("#orgActive").html(block);
}

function assignPoints(act, key){

   firebase.database().ref('object/users/'+ key + '/yanjupoints').transaction(function(points) {
     var value = 0;

     if(act == "completepost") value = 10;
     else if(act == "postblog") value = 10;
     else if(act == "referconsultant") value = 4;
     else if(act == "postcomment") value = 1;

     return (points || 0) + value;
   });
}

  //................navigation/ router
function clearAll(){   //see if you can display none body
  document.getElementById('home').display = 'none';
  document.getElementById('whyPage').display = 'none';
}

function resizeAndGetDataURL(reader, tempImg){
  var MAX_WIDTH = 250;
  var MAX_HEIGHT = 250;
  var tempW = tempImg.width;
  var tempH = tempImg.height;
  if (tempW > tempH) {
    if (tempW > MAX_WIDTH) {
       tempH *= MAX_WIDTH / tempW;
       tempW = MAX_WIDTH;
    }
  } else {
    if (tempH > MAX_HEIGHT) {
       tempW *= MAX_HEIGHT / tempH;
       tempH = MAX_HEIGHT;
    }
  }
  tempW = 250; tempH = 250;
  var canvas = document.createElement('canvas');
  canvas.width = tempW;
  canvas.height = tempH;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(tempImg, 0, 0, tempW, tempH);
  var dataURL = canvas.toDataURL("image/jpeg");

  return dataURL;
}

function savePicture() {
  $('#blah').attr('src', '').hide();
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    var tempImg = new Image();
    var file = this.files[0];  //this.files[0].name

    $(reader).load(function(e) {
      tempImg.src = e.target.result;
      //var dataURL = resizeAndGetDataURL(this, tempImg);

      $('#blah').attr('src', e.target.result) 

      var task = firebase.storage().ref('/images/'+file.name).put(file);
      task.on('state_changed', function(snapshot){

      }, function(error){
           console.log(error);
      }, function(){
          console.log("uploaded image");
          userDets.pic = task.snapshot.downloadURL;
          firebase.database().ref('/object/users/'+userDets.uid).update({ pic: userDets.pic  });
      });
    });
    reader.readAsDataURL(this.files[0]);
  }
}
 

function saveReport(files, pid) {
   // var pid = 123;
  if (files && files[0]) {
    var file = files[0];
    var reader = new FileReader();
    $(reader).load(function(e) {

//      var task = firebase.storage().ref('/reports/template/' +file.name).put(file);
      var task = firebase.storage().ref('/reports/'+pid+ '/' +file.name).put(file);
      task.on('state_changed', function(snapshot){

      }, function(error){
           console.log(error);
      }, function(){
          console.log("uploaded report: " + file.name );

	  $("#reportSucceed").html("Report Saved. Attach and Mail");
	  window.location.href ='mailto:' + allPosts[pid].email +'?subject=Report for your project on Yanju&body=project Title: ' + allPosts[pid].title + '&attachment=C:\inetpub\wwwroot\yanju\README.md' ;

	firebase.database().ref('object/posts/' + pid + '/numReports').transaction(function(numReports) {
 	  var num = (numReports || 0) + 1;
	  firebase.database().ref('/object/posts/'+pid+ '/reports').push({ link: task.snapshot.downloadURL })

	  if(num <= 1){
	      firebase.database().ref('object/metric/solutions').transaction(function(solutions) {
       		 return (solutions || 0) + 1;
    	      });
 	  }
	  return num;
	});
      });
    });
    reader.readAsDataURL(file);
  }
}
  
function getXHR(){
   var xmlhttp;
   
   try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
   } catch (e) {
    try {
     xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
     xmlhttp = false;
    }
   }

  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    try {
      xmlhttp = new XMLHttpRequest();
    } catch (e) {
      xmlhttp=false;
    }
  }
  if (!xmlhttp && window.createRequest) {
    try {
      xmlhttp = window.createRequest();
    } catch (e) {
      xmlhttp=false;
    }
  }
  return xmlhttp;
}

//function load(page){
window.load = function(page){
   load2(page, -1);
}

function load2(page, ind){
   var f = getXHR();   var file;
    
  if(page == 'profile')
     if(loggedIn) file = 'profile.html';
     else alert("Please signup or log in to add post");
  else if(page == 'signup') file = 'signup.html';
  else if(page == 'login') file = 'login.html';
  else if(page == 'blog') file = 'dela.html';
  else if(page == 'updateProfile') 
    if(loggedIn) file = 'updateProfile.html';
    else alert("Please signup or log in to add post");
  else if(page == 'createpost') 
    if(loggedIn) file = 'createpost.html';
    else alert("Please signup or log in to add post");
  else if(page == 'edit') 
    if(loggedIn) file = 'createpost.html';
    else alert("Please signup or log in to edit post");
  else if(page == 'allconsultants') file = 'consultants.html';
  else if(page == 'home' || page == 'posts' || page == 'myposts') file = 'home.html';
  else if(page == 'projectpg') file = 'projectpg.html';
  else if(page == 'howtopostproject') file = 'howtopostproject.html';
  else if(page == 'orgs') file = 'orgs.html';
  else file = 'home.html';

  f.open("GET", file, true);
  var measure = {};

    f.onreadystatechange = function ()
    {
      if(f.readyState === 4)
      {
        if(f.status === 200 || f.status == 0)
        {   
          document.getElementById('main').innerHTML = f.responseText; 

        if(page == 'createpost'){
 	  window.location.hash = '';
          if(userDets) {
            document.getElementById("usrEmail").value = userDets.email;
            populateCountries();
	    populateIndustries();
	    populateCategories('category'); ;
          }

	  $("#cName").change(function() { 
		$('#cMission').val('');
            	$('#cWeb').val('');
            	$('#cIndustry').val('');

		for(var key in orgs){
		   if(orgs[key].cName.toLowerCase() == $(this).val().toLowerCase()){
		      $('#cMission').val(orgs[key].cMission);
            	      $('#cWeb').val(orgs[key].cWeb);
            	      $('#cIndustry').val(orgs[key].cIndustry);
            	      $('#country').val(orgs[key].country);
 		   }
                }
	  });

	  firebase.database().ref('/object/orgs').once('value').then(function(snap){
              orgs = snap.val(); orgNames = [];

              for(var key in orgs){
		 orgNames.push(orgs[key].cName);
              } 

	      $( "#cName" ).autocomplete({
      		source: orgNames
    	      });
           });

        }else if(page == 'home'){
  	   $("#searchText").on('keyup', function(e){
      	     e.preventDefault();
             var x = e || window.event;
             var key = (x.keyCode || x.which);
             if(key == 13|| key == 3){
	      // $('#searchBtn').trigger('click');
		searchPosts();
             }
  	   });


          loadAllPosts();
	  scrollToHash();
        }else if(page == 'posts'){
	  window.location.hash = 'postsSection';
          loadAllPosts();
	  scrollToHash();
        }else if(page == 'myposts'){
	  window.location.hash = 'postsSection';
          loadMyPosts();
 	  scrollToHash();
        }else if(page == 'projectpg'){
	   $('#pCategory').html(allPosts[ind].category);
	   var weblink = allPosts[ind].cWeb;
	   if(weblink && weblink.indexOf('http') == -1 ) weblink = 'http://' + weblink;
	   $('#pHeader').html(' <h2 style="margin-bottom: 0px; ">'+ allPosts[ind].title +'</h2><br/><span style="">By '+ allPosts[ind].owner +', with <a href="'+ weblink +'" target="_blank">'+ allPosts[ind].cName+'</a> in '+ allPosts[ind].country + '</span><br/><span style=""><i>'+ allPosts[ind].date +'</i></span>');
	   $('#pDescription').html(allPosts[ind].description);
	   $('#pBackground').html(allPosts[ind].cBac);

 	   var btnsText = '';	
  	   if(userDets.name && (userDets.name.toLowerCase() == allPosts[ind].owner.toLowerCase())){
    		btnsText += '<br><a href="javascript:edit(\'' + ind + '\',\'' + allPosts[ind].title + '\')">Edit</a> | ';
    		btnsText += '<a href="javascript:del(\'' + ind + '\',\'' + allPosts[ind].title + '\')">Delete</a> | ';
    	   	if(allPosts[ind].consultant && allPosts[ind].consultant.length > 0)
      		   btnsText += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + ind + '\')">Edit completion details</a></div>';    
    	   	else btnsText += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + ind + '\')">Mark as complete</a></div>';    
		$("#pButtons").html(btnsText);
  	   } else {
//      	btnsText += '<br><a onclick="javascript:window.location.href =\'mailto:' + allPosts[ind].email +'?subject=Follow up on your Yanju Post&body=Details: ' + allPosts[ind].description +';\'">Send Email to consult</a>  ';
		btnsText += '<br/><a onclick="javascript:window.location.href =\'mailto:' + allPosts[ind].email +'?subject=Follow up on your Yanju Post - '+ allPosts[ind].title +' &body=Details: ' + allPosts[ind].description +
                        ' %0AShort Bio: '+ userDets.bio +' %0AResponse: ;\'">Send Email to consult</a>  '+
      			'<form id="form1" runat="server">'+
        		   '<label style="cursor: pointer;"><span>Upload Report</span> <input type="file" id="reportInp" style="display:none" /></label>'+
      			'</form> <br/>'+
			'<a href="https://firebasestorage.googleapis.com/v0/b/yanjudev.appspot.com/o/reports%2Ftemplate%2FYanju%20Project%20Report%20Template.docx?alt=media&token=315baa88-0586-4179-a874-ba3dad58d035" style="position: relative; top: -20px;" download>Template</a>';
	   	$("#pButtons").html(btnsText);

		$("#reportInp").change(function(e){
		   if (this.files && this.files[0]) 
		      saveReport(this.files, ind);
		}); 

		// $("#reportInp").change(saveReport);

      		//use user.emailVerified to know if you should send email

  	   }


	   firebase.database().ref('object/posts/'+ind+ '/views').transaction(function(views) {
	     var v = (views || 1) + 1; 
	     $("#views").html(v);
 	     return v;
	   });
	
        }else if(page == 'edit'){
	    window.location.hash = '';
            var key = mode;
	    mode2 = allPosts[key].orgId;
            populateCountries();
	    populateIndustries();
	    populateCategories('category'); 

            $('#title').val(allPosts[key].title);
            $('#description').html(allPosts[key].description);
            $('#category').val(allPosts[key].category); 
            $('#cName').val(allPosts[key].cName);
            $('#cMission').val(allPosts[key].cMission);
            $('#cWeb').val(allPosts[key].cWeb);
            $('#cIndustry').val(allPosts[key].cIndustry);
            $('#cBac').val(allPosts[key].cBac);
            $('#country').val(allPosts[key].country);
            $('#usrEmail').val(allPosts[key].email); 
        }
        else if(page == 'signup'){
          /* 
           $('#blah').load(function(e) {
          $(this).css('height', '200px').show();
           }).show(); 

           $("#imgInp").change(readURL);
           */
        }
		else if(page == 'updateProfile'){
		   $("#signName").val(userDets.name);
		   $("#signEmail").val(userDets.email);
		   $("#plinkedin").val(userDets.linkedin);
		   $("#origin").val(userDets.origin);
		   $("#school").val(userDets.school);
		   $("#work").val(userDets.work);
		   $("#bio").val(userDets.bio);
		   $("#yanjureason").val(userDets.yanjureason);
		   $("#projectreason").val(userDets.projectreason);

	           populateCategories('pref1'); 
	           populateCategories('pref2');
	           populateCategories('pref3');
		   $("#pref1").val(userDets.pref1);
		   $("#pref2").val(userDets.pref2);
		   $("#pref3").val(userDets.pref3);

		   
		   $('#blah').load(function(e) {
			$(this).css('height', '200px').show();
		   }).show();	

		   $("#imgInp").change(savePicture);

		   if(userDets.isConsultant && userDets.isConsultant == 1) {
			wasConsultant = 1;
			$('#consultantToggle').prop('checked',true);
			 $("#selectPrefs").removeClass('hide');
		   } else wasConsultant = 0;

		   $('#consultantToggle').change(function() {
     			if(this.checked) {
         		   $("#selectPrefs").removeClass('hide');
     			}else{
         		   $("#selectPrefs").addClass('hide');
			}
 		   });
		}
        else if(page == 'profile'){
           $("#pname").html(userDets.name);
           $("#pwork").html(userDets.work);
           $("#pbio").html(userDets.bio);
           $("#cproj").html(userDets.completedProjects);
           $("#plinkedin").html("<a href='"+ userDets.linkedin + "' target='_blank'> link </a>");		
	   $("#pemail").click(function(){ window.location.href ='mailto:' + userDets.email +'?subject=Yanju%20Consultant%20Outreach;' });
           $("#porigin").html(userDets.origin);
           $("#pschool").html(userDets.school);
           $("#ppref1").html(userDets.pref1);
           $("#ppref2").html(userDets.pref2);
           $("#ppref3").html(userDets.pref3);

           $('#profImg').attr('src', userDets.pic);
        }
        else if(page == 'allconsultants'){
           firebase.database().ref('/object/users').once('value').then(function(snap){
              allUsers = snap.val(); 
              var consultantsListText = '  <div style="display:flex; flex-wrap: wrap;justify-content: space-around;">';

              for(var key in allUsers){
                if(allUsers[key].profileUpdate == 1 && allUsers[key].isConsultant == 1){
                  consultantsListText = consultantsListText + addConsultantBlock(allUsers[key]);  //somehtml look
                }
              }

	      consultantsListText = consultantsListText + "</div>";
              $("#consultantList").html(consultantsListText);
            });
        } 
        else if(page == 'orgs'){
           firebase.database().ref('/object/orgs').once('value').then(function(snap){
              orgs = snap.val(); 
              var orgsText = "";

              for(var key in orgs){
                orgsText= orgsText + addOrgBlock(orgs[key]);  
              }

              $("#orgList").html(orgsText);
            });
        } 
      }
    }
  }
  measure.start = (new Date()).getTime();
  f.send(null);
  measure.end = (new Date()).getTime();
  measure.len = parseInt(f.getResponseHeader('Content-Length') || 0);
  measure.delta = measure.end - measure.start;
  console.log(page + ' load time in ms is ' + measure.delta);
}

function hashCode(str){

    var hash = 0;

    if (str.length == 0) return hash;

    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);       hash = ((hash<<5)-hash)+char;     hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function referFriend(){

window.location.href ='mailto:?subject=Try out Yanjuhub &body= Good Day :)%0A%0A I believe you will benefit from joining the Yanjuhub community. Visit yanjuhub.com to see that it fits your current needs. %0A%0A Use this refer code when you signup <b>' + $("#referalCode").val() +
           '</b> %0A%0ACheers';

/*  var copyText = document.getElementById("referalCode");
  copyText.select();
  document.execCommand("Copy");*/
}
