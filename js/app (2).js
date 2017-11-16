// beautify posts (use panels for each post). validate emails on login. add general section/ prompt to provide email soln or schedule meeting. display consultant of the week. in-memory client side data storage is good for speed but terrible but things scale, n drains battery life.incentivise startups to help startups with points. fly startups and consultants to opposite places? improve footer.
//  resize photo. add guides. build better profile page. build post page. add consult toggle on profilepage. move profile/logout to name button. fix iphone tin. guides -> how to post, how to consult. back btn not working with load. suggest better description. mission/ vision page. consultant profile pg along with their pref schedule. visuals for stuff eg graph of impact or map to describe how it works. read impact report of boston.masschallenge.org eg our startups are 3x more likely to survive or raise funding.  
// recommend yanju after post. view guides after consultant toggle. 
//https://www.w3schools.com/howto/howto_css_calendar.asp
//sade@uju.com apples
  

//.....................decide if dev mode or prod

const localhost = document.URL.toLowerCase().includes("local") || document.URL.toLowerCase().includes("127.0.");

//.....................end

//.......................modal code

// When the user clicks the button, open the modal 
function openCreateDialog() { 
    if(!loggedIn) {
	alert("Please signup or log in to add post");
    }else{ 
       document.getElementById('createPostModal').style.display = "block";
       document.getElementById("usrEmail").value = userDets.email;
    }
}

// When the user clicks on <span> (x), close the modal
function closeDialog() {

    var length = document.getElementsByClassName("modal").length - 1;
    while(length > -1){
	document.getElementsByClassName("modal")[length--].style.display = "none";
    }
}

/*
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
*/
//...................modal end

//...................firebase start

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

//.....................firebase stop


//create refs
   const dbRefObj = firebase.database().ref().child('object');
   const usersRef= dbRefObj.child('users'); var postsRef; 
   postsRef = dbRefObj.child('posts'); 

   var allPosts = []; var userDets = {}; var allCountries = {}; var allUsers = {};
   var loggedIn = false;
   var user;
   var mode = 0; // 0 for add, key for other operations

//......................login begin
   const preObj = document.getElementById('object');
   const ulList= document.getElementById('list');
   const txtEmail= document.getElementById('txtEmail');
   const txtPassword= document.getElementById('txtPassword');
   const btnLogin= document.getElementById('btnLogin');
   const btnSignup= document.getElementById('btnSignup');
   const btnLogout= document.getElementById('btnLogout');
   const welcomeArea= document.getElementById('welcomeArea');
   const loginBox= document.getElementById('loginBox');

   btnLogin.addEventListener('click', e => {

	const em = txtEmail.value;
	const p = txtPassword.value;
	const auth = firebase.auth();

 	//const promise = auth.signInWithEmailAndPassword(em, p);
	//promise.catch(e => console.log("Error "+ e.message));

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
   });

   function signUp(){

    	const n = document.getElementById('signName').value;
    	const e = document.getElementById('signEmail').value;
    	const p = document.getElementById('signPassword').value;
    	const passC = document.getElementById('signPasswordCheck').value;
	const auth = firebase.auth();

      	if(passC == p){
	  auth.createUserWithEmailAndPassword(e, p).then(function(user) {
            alert("Signup successful. You are logged in now");   //for mobile use some 5s disappearing status bar

	    var userId = firebase.auth().currentUser.uid; //try to push using key uid
	    firebase.database().ref('object/users/'+userId).set({
	         name: n, email: e, profileUpdate:0, uid: userId
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

   btnLogout.addEventListener('click', e => {
	firebase.auth().signOut();
   });

   firebase.auth().onAuthStateChanged(firebaseUser => {
	if(firebaseUser){
 	     loggedIn = true; 
	     if(firebase.auth().currentUser){
		var isProfileUpdated = 0, myname = '', myemail = '';
	    	var userId = firebase.auth().currentUser.uid;
//	    	firebase.database().ref('/object/users/uid:"'+userId+'"' )
		usersRef.orderByChild("uid").equalTo(userId).once('value').then(function(s) {
 		  if(s.val() && s.val()[userId]){
 		     isProfileUpdated = s.val()[userId].profileUpdate;
                     myname = s.val()[userId].name; myemail = s.val()[userId].email;
		
  	    	     userDets = {
			name: myname, email: s.val()[userId].email, profileUpdate:isProfileUpdated, 
			uid:userId, origin: s.val()[userId].origin, school: s.val()[userId].school,
			pref1: s.val()[userId].pref1, pref2: s.val()[userId].pref2, pref3: s.val()[userId].pref3,
			pic: s.val()[userId].pic
		     };
		     load('home');
		     welcomeArea.classList.remove('hide');
	  	   //  welcomeArea.innerHTML= "Welcome "+ userDets.name;
	  	     welcomeArea.innerHTML= "<img id='welcomeImg' src='"+ userDets.pic + "' style='border-radius: 50%; width:20px; height:20px;'/> " + userDets.name;
	 
	    	     if(!isProfileUpdated){
    		        var answer = confirm('Will you like to complete your user profile?');
		        if(answer)
		          load('updateProfile');
   	    	     } 

	      	     console.log("Login successful "+userDets.name);  		// what of creating sessions etc?
	      
		  }
	        });
	    	
	      } else {var x = 1; }
	  
	  //    loginBox.classList.add('hide');
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
	 //   loginBox.classList.remove('hide');
	    $('#txtEmail').removeClass('hide');
	    $('#txtPassword').removeClass('hide');
	    $('#btnLogin').removeClass('hide');
	    $('#btnSignup').removeClass('hide');
	    btnLogout.classList.add('hide');
	    welcomeArea.classList.add('hide');
	}
   });

//......................login end

function testLoad(){
		var userId = firebase.auth().currentUser.uid; var i; var m;

		usersRef.orderByChild("uid").equalTo(userId).once('value').then(function(s) {
 		  if(s.val()){
		     var values = s.val();
		     for (var key in values) {
        		if (values.hasOwnProperty(key)) {
			   i = values[key].profileUpdate;
                   	   m = values[key].name;
		           alert(i + ' ' + m);
			}
		    }
		  }
	        });

		
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
      var o = userDets.name; 
      var coun = $('#country option:selected').text().trim();
      var da;
      if(mode == 0) da = new Date().toGMTString();

      sendMail(d); // stop doing this when posts created are too many. only send in prod -> 200 a month limit

      var post = {title:t, description:d, category:c, cName:cN, email:e, owner:o, consultant:'', date:da, country: coun};

      if (t.length > 0 && d.length > 0) {
        savePostToDb(post);
      } else alert("Title or Description are entered incorrectly");
  
      clearForm();
      load('posts');
      alert('Post added');
    }
};

function clearForm(){
    document.getElementById('title').value = '';
    $('#category').val('Business Plan');
    $('#country').val(0)
    document.getElementById('description').value = '';
    document.getElementById('cName').value = '';
    document.getElementById('usrEmail').value = '';
}

function savePostToDb(post){ 

    if(mode == 0){
      postsRef.push({
          title:post.title, description:post.description, category:post.category, cName:post.cName, email:post.email, owner:post.owner, consultant:"", date:post.date, country: post.country
      });
    }else{  //mode == key
        postsRef.child(mode).update({    
            title:post.title, description:post.description, category:post.category, cName:post.cName, email:post.email, owner:post.owner, country: post.country
        });
	mode = 0;
    }
}

function refreshUI2(list) {
    var lis = '';
    for (var i = 0; i < list.length; i++) {
        lis += '<div data-key="' + list[i].key + '">' + genPosts(list[i]) + '</div>';

    };
    if(list.length == 0) lis = '<p class="groove postlist cell" style="color:red">No posts found</p>';
    document.getElementById('posts').innerHTML = lis;
};

function genPosts(list) {  //need country, 
    var links = '';
    links += '<div class="groove postlist cell"><h1>' +list.title+ '</h1> by '+ list.cName+ ', '+ list.country +' <br>';
    links += '<i>' +list.category+ '</i> '+ list.date + '<br><br>' ;
    links += 'Owner: '+ list.owner + ' <br>';
    links += 'Details: ' +list.description;

    if(list.consultant && list.consultant.length > 0)  links += '<br><b>' +list.consultant + '</b> is the Consultant who solved this case';

    if(userDets.name && (userDets.name.toLowerCase() == list.owner.toLowerCase())){
	links += '<br><a href="javascript:edit(\'' + list.key + '\',\'' + list.title + '\')">Edit</a> | ';
        links += '<a href="javascript:del(\'' + list.key + '\',\'' + list.title + '\')">Delete</a> | ';
        if(list.consultant && list.consultant.length > 0)
	    links += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + list.key + '\')">Edit completion details</a></div>';    
	else links += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + list.key + '\')">Mark as complete</a></div>';    
    }else {
	links += '<br><a onclick="javascript:window.location.href =\'mailto:' + list.email +'?subject=Follow up on your Yanju Post&body=Details: ' + list.description +';\'">Send Email to consult</a>  ';
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

        firebase.database().ref('object/metric/solutions').transaction(function(solutions) {
 	   return (solutions || 0) + 1;
	}); 
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

firebase.database().ref('object/metric/consultants').on("value", function(snap){
    $('#metricB').html(snap.val());
});

firebase.database().ref('object/metric/solutions').on("value", function(snap){
    $('#metricA').html(snap.val());
});

function updateProfile(){
    	    
    userDets.name = $("#signName").val(); 
    userDets.email = $("#signEmail").val(); 
    userDets.origin = $("#origin").val(); 
    userDets.school = $("#school").val();
    if($('#consultantToggle').is(':checked')){
      userDets.pref1 = $("#pref1").val(); 
      userDets.pref2 = $("#pref2").val(); 
      userDets.pref3 = $("#pref3").val(); 
      userDets.isConsultant = 1;
    } else userDets.isConsultant = 0;

    if(userDets.profileUpdate == 0){
	userDets.profileUpdate = 1;
        firebase.database().ref('object/metric/consultants').transaction(function(consultants) {
 	   return (consultants || 0) + 1;
	}); 
    }

    firebase.database().ref('object/users/'+userDets.uid).update({
        name: userDets.name, email: userDets.email, profileUpdate:1, 
	origin: userDets.origin, school: userDets.school, pref1: userDets.pref1, pref2: userDets.pref2, pref3: userDets.pref3, isConsultant: userDets.isConsultant 
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
	   if (allPosts.hasOwnProperty(key) && allPosts[key].title && allPosts[key].title.toLowerCase().includes(text)) add = true;		
       } else if(filter == 'cName' && allPosts[key].isComplete != 1){
	   if (allPosts.hasOwnProperty(key) && allPosts[key].cName && allPosts[key].cName.toLowerCase().includes(text)) add = true;		
       } 
	
       if(add) {
	   newList.push({
		    description: allPosts[key].description ? allPosts[key].description : '',
		    title: allPosts[key].title ? allPosts[key].title : '',
		    cName: allPosts[key].cName ? allPosts[key].cName : '',
		    category: allPosts[key].category ? allPosts[key].category : '',
		    email: allPosts[key].email ? allPosts[key].email : '',
		    owner: allPosts[key].owner ? allPosts[key].owner : '',
		    date: allPosts[key].date ? allPosts[key].date : '',
		    country: allPosts[key].country ? allPosts[key].country : '',
		    consultant: allPosts[key].consultant ? allPosts[key].consultant : '',
                    key: key
		})	
	  add = false;
       }
	    
   }

    refreshUI2(newList.reverse());

}

function loadAllPosts(){
    var list = [];

/*    if(localhost && loggedIn)
	list = [{title: "Risk analysis", description:"Conduct analysis before running with year finance plan", category:'finance plan', cName:'Onefi', email:'alextsado@gmail.com', owner:'alextsado'},
                {title: "Help raise money", description:"We will soon go to VCs for series A funding, we don't know what to expect.", category:'finance plan', cName:'Lidya', email:'sade@uju.com', owner:'Sade'},
                {title: "Entering new market with payment app", description:"preparing to launch in Kenya after success in Nigeria. Help", category:'Market Plan', cName:'Lidya', email:'sade@uju.com', owner:'Sade'}
               ];
    else{ */
      for (var key in allPosts) {
        if (allPosts.hasOwnProperty(key)) {
            var t = allPosts[key].title ? allPosts[key].title : '';
            var d = allPosts[key].description ? allPosts[key].description : '';
            var c = allPosts[key].category ? allPosts[key].category : '';
            var cN = allPosts[key].cName ? allPosts[key].cName : '';
            var e = allPosts[key].email ? allPosts[key].email : '';
            var o = allPosts[key].owner ? allPosts[key].owner : '';
            var coun = allPosts[key].country ? allPosts[key].country : '';
            var da = allPosts[key].date ? allPosts[key].date : '';
	    var con = allPosts[key].consultant ? allPosts[key].consultant : '';

            if (t.trim().length > 0) {
                list.push({
                    description: d,
		    title: t,
		    cName: cN,
		    category: c,
		    email: e,
		    owner: o,
		    date: da,
		    consultant: con,
		    country: coun,
                    key: key
                })
            }
        }
      }
  //  }

    refreshUI2(list.reverse());
}

function loadMyPosts(){  //change to use owner and not cName
   var newList= [];
   var add = false;

   for(var key in allPosts) {
	if (allPosts.hasOwnProperty(key) && allPosts[key].owner && allPosts[key].owner.toLowerCase().includes(userDets.name.toLowerCase())) {
	       newList.push({
		    description: allPosts[key].description ? allPosts[key].description : '',
		    title: allPosts[key].title ? allPosts[key].title : '',
		    cName: allPosts[key].cName ? allPosts[key].cName : '',
		    category: allPosts[key].category ? allPosts[key].category : '',
		    email: allPosts[key].email ? allPosts[key].email : '',
		    owner: allPosts[key].owner ? allPosts[key].owner : '',
		    date: allPosts[key].date ? allPosts[key].date : '',
		    country: allPosts[key].country ? allPosts[key].country : '',
		    consultant: allPosts[key].consultant ? allPosts[key].consultant : '',
                    key: key
		})
    	}		    
   }

    refreshUI2(newList.reverse());

}

postsRef.on("value", function(snapshot) {
    allPosts = snapshot.val();
    loadAllPosts();
});

function generateCountryList(){

   var c = {0: 'Algeria', 1: 'Angola', 2: 'Benin', 3: 'Botswana', 4: 'Burkina Faso',
        5: 'Burundi', 6: 'Cabo Verde', 7: 'Cameroun', 8: 'Central African Republic', 
        9: 'Chad', 10: 'Comoros', 11: 'Congo', 12: "Cote D'Ivoire", 13: 'Djibouti', 14: 'Egypt', 15: 'Equatorial Guinea',
	16: 'Eritrea', 17: 'Ethiopia', 18: 'Gabon', 19: 'Gambia', 20: 'Ghana', 21: 'Guinea', 
	22: 'Guinea-Bissau', 23: 'Kenya', 24: 'Lesotho', 25: 'Liberia', 26: 'Libya', 27: 'Madagascar', 28: 'Malawi', 29: 'Mali',
        29: 'Mauritania', 30: 'Mauritius', 31: 'Morocco', 32: 'Mozambique', 33: 'Namibia', 34: 'Niger', 35: 'Nigeria', 
        36: 'Rwanda', 37: 'Sao Tome', 38: 'Senegal', 39: 'Seychelles', 40: 'Sierra Leone', 41: 'Somalia', 42: 'South Africa', 
        43: 'South Sudan', 44: 'Sudan', 45: 'Swaziland', 46: 'Tanzania', 47: 'Togo', 48: 'Tunisia', 49: 'Uganda', 50: 'Zambia', 51:'Zimbabwe' 
   };

   firebase.database().ref('/object/generics/').update({
	countries: c
   });

   return c;
}

function populateCountries(){
   
   $country = $("select[name='country']");

   if(allCountries.hasOwnProperty(0))
	for(var key in allCountries)
	    $("<option value='"+ key +"'>"+ allCountries[key] + "</option>").appendTo($country);
   else	{			
	firebase.database().ref('/object/generics/countries').once('value').then(function(snap){
	  allCountries = snap.val(); 
	  if(!snap.val() || snap.val().length < 1) 
  	     allCountries = generateCountryList();

	     for(var key in allCountries)
	     	$("<option value='"+ key +"'>"+ allCountries[key] + "</option>").appendTo($country);
        });
   }
}

function addConsultantBlock(consultant){
  var block = ""; var img = new Image();

  if(consultant){

    block = '<a href="#" class="list-group-item" onclick="loadActiveConsultant(\''+consultant.uid +'\')">'+
	      '<table><tr><td style="width:40%;">'+
	      '<img src="'+ consultant.pic +'" alt="Image not uploaded yet" style="height:150px; width:150px;"/>'+
	      '</td><td style="width:60%;">'+
              '<h4 class="list-group-item-heading">'+ consultant.name +'</h4>'+
              '<p class="list-group-item-text">'+
		'<b>Affiliation:</b> '+consultant.school+' </br>'+
		'<b>Expertise:</b> '+ consultant.pref1 + ', ' + consultant.pref2 + ', ' + consultant.pref3 +' </br>'+
		'<b>Yanju points:</b> 50'+	
	      '</p></td></tr></table>'+
            '</a> ';
  }

  return block;
}

function loadActiveConsultant(key){
  var block = "";

  block = '<center><img src="'+ allUsers[key].pic +'" alt="Image not uploaded yet" style="width:250px;"/><br/><br/>' +
		'<b>Name:</b> '+ allUsers[key].name +' </br>' +
		'<b>Affiliation:</b> '+ allUsers[key].school +' </br>' +
		'<b>Expertise:</b> '+ allUsers[key].pref1 +', '+ allUsers[key].pref2 +', '+ allUsers[key].pref3 + ' </br>'+
		'<b>Yanju points:</b> 50	';

  $("#consultantActive").html(block);
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
/*
function tryResize(image){
  	mainCanvas = document.createElement("canvas");
        mainCanvas.width = 1024;
        mainCanvas.height = 768;
        var ctx = mainCanvas.getContext("2d");
        ctx.drawImage(image, 0, 0, mainCanvas.width, mainCanvas.height);
        //size = parseInt($('#size').get(0).value, 10);
	size = 350;
        while (mainCanvas.width > size) {
            mainCanvas = halfSize(mainCanvas);
        }
    //    $('#outputImage').attr('src', mainCanvas.toDataURL("image/jpeg"));

	return mainCanvas.toDataURL("image/jpeg");
} 

    var halfSize = function (i) {
        var canvas = document.createElement("canvas");
        canvas.width = i.width / 2;
        canvas.height = i.height / 2;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(i, 0, 0, canvas.width, canvas.height);
        return canvas;
    };
*/
function readURL() {
	$('#blah').attr('src', '').hide();
	if (this.files && this.files[0]) {
		var reader = new FileReader();
		var tempImg = new Image();
		var file = this.files[0];  //this.files[0].name

		$(reader).load(function(e) {
			tempImg.src = e.target.result;
			//var dataURL = resizeAndGetDataURL(this, tempImg);
			//$('#blah2').attr('src', tryResize(tempImg));	

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
/*
function show(page){
   load('home');
   
   if(page == 'posts'){
      loadAllPosts();
   }else if(page == 'myposts'){
      loadMyPosts();
   } if(page == 'suggest'){
    //  document.getElementById('suggestModal').display = 'block';
   } //add an else with some error page
} */
 
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

window.load = function(page){
//function load(page){
   var f = getXHR();   var file;
    
    if(page == 'profile')
	if(loggedIn) file = 'profile.html';
	else alert("Please signup or log in to add post");
    else if(page == 'signup') file = 'signup.html';
    else if(page == 'blog') file = 'blog.html';
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
    else file = 'home.html';

    f.open("GET", file, true);
    f.onreadystatechange = function ()
    {
        if(f.readyState === 4)
        {
            if(f.status === 200 || f.status == 0)
            {   
    		document.getElementById('main').innerHTML = f.responseText; 

		if(page == 'createpost'){
       		   if(userDets) {
			document.getElementById("usrEmail").value = userDets.email;
			populateCountries();
		   }
		}else if(page == 'home' || page == 'posts')
		   loadAllPosts();
		 else if(page == 'myposts')
		   loadMyPosts();
		else if(page == 'edit'){
		   var key = mode;
		   document.getElementById('title').value = allPosts[key].title;
		    document.getElementById('description').innerHTML = allPosts[key].description;
		  //  document.getElementById('category').selectedIndex = allPosts[key].category; //switch from text to number
		    document.getElementById('cName').value = allPosts[key].cName;
		    document.getElementById('usrEmail').value = allPosts[key].email;
		    populateCountries(); 
		   // $('#country').text('') ;
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
		   $("#origin").val(userDets.origin);
		   $("#school").val(userDets.school);
		   $("#pref1").val(userDets.pref1);
		   $("#pref2").val(userDets.pref2);
		   $("#pref3").val(userDets.pref3);

		   
		   $('#blah').load(function(e) {
			$(this).css('height', '200px').show();
		   }).show();	

		   $("#imgInp").change(readURL);

		   if(userDets.isConsultant && userDets.isConsultant == 1) {
			$('#consultantToggle').prop('checked',true);
			 $("#selectPrefs").removeClass('hide');
		   } //store ifconsultant. if this up or down, update count

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
		   $("#pemail").html(userDets.email);
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
		      var consultantsListText = "";

		      for(var key in allUsers){
			  if(allUsers[key].profileUpdate == 1){
			      consultantsListText = consultantsListText + addConsultantBlock(allUsers[key]);  //somehtml look
			  }
		      }

		      $("#consultantList").html(consultantsListText);
        	   });

		}	
            }
        }
    }
    f.send(null);

}
/*
$(window).load(function(){
   function tes1(){
	alert('tes1');
   }
});

$(document).ready(function(){
   function tes2(){
	alert('tes2');
   }
});
*/

window.tes = function(){
   alert('tes');
}


