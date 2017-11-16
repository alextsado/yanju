// position login better, save consultant contribution, mobile popups aren't working, add real testimonials, beautify posts. validate emails on login. add general section/ prompt to provide email soln or schedule meeting. display consultant of the week. in-memory client side data storage is good for speed but terrible but things scale, n drains battery life.
// correct update consultant. back btn not working with load. post signup page info collect. suggest better description. mission/ vision page. consultant profile pg along with their pref schedule. visuals for stuff eg graph of impact or map to describe how it works. read impact report of boston.masschallenge.org eg our startups are 3x more likely to survive or raise funding.  
//sade@uju.com apples


//.....................decide if dev mode or prod

const localhost = false;// document.URL.toLowerCase().includes("local") || document.URL.toLowerCase().includes("127.0.");

//.....................end

//.......................modal code

// When the user clicks the button, open the modal 
function openCreateDialog() { 
    if(!loggedIn) {
	alert("Please signup or log in to add post");
    }else{ 
       document.getElementById('createPostModal').style.display = "block";
       document.getElementById("usrEmail").value = user.email;
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

const config = {
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
   if(!localhost) postsRef = dbRefObj.child('posts'); 
   else postsRef = dbRefObj.child('prod_posts'); 

   var allPosts = []; var userDets = {};
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
	/*    var isProfileUpdated = 0, myname = '';
	    var userId = firebase.auth().currentUser.uid;
	    firebase.database().ref('/object/users/'+userId ).once('value').then(function(s) {
 		if(s.val()){
 		   isProfileUpdated = s.val().profileUpdate;
                   myname = s.val().name;
		}
	    });

  	    userDets = {name: myname, email: em, profileUpdate:isProfileUpdated};
	    load('home');
	    if(!isProfileUpdated){
    		var answer = confirm('Will you like to complete your user profile?');
		if(answer)
		    load('updateProfile');
   	    } */
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



/*
        .catch(function(error) {
      	  // Handle Errors here.
      	  var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
          } else {
            alert(errorMessage);
          }
            console.log(error);
        });
*/
   });

   function signUp(){
//ref.child("Victor").setValue("setting custom key when pushing new data to firebase database");

    	const n = document.getElementById('signName').value;
    	const e = document.getElementById('signEmail').value;
    	const p = document.getElementById('signPassword').value;
    	const passC = document.getElementById('signPasswordCheck').value;
	const auth = firebase.auth();

      	if(passC == p){
	  auth.createUserWithEmailAndPassword(e, p).then(function(user) {
            alert("Signup successful. You are logged in now");   //for mobile use some 5s disappearing status bar

	    var userId = firebase.auth().currentUser.uid; //try to push using key uid
 	    usersRef.push({
	         name: n, email: e, profileUpdate:0, uid: userId
            });    //var x = push().key works too
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
	if(firebaseUser || localhost){
 	  loggedIn = true; 
	  if(localhost) userDets = {name:'Sade', email:'sade@uju.com'} ;
	  else {
	     if(firebase.auth().currentUser){
		var isProfileUpdated = 0, myname = '', myemail = '';
	    	var userId = firebase.auth().currentUser.uid;
//	    	firebase.database().ref('/object/users/uid:"'+userId+'"' )
		usersRef.orderByChild("uid").equalTo(userId).once('value').then(function(s) {
 		  if(s.val()){
 		   //isProfileUpdated = s.val().profileUpdate;
                   //myname = s.val().name; myemail = s.val().email;

		     var values = s.val();
		     for (var key in values) {
        		if (values.hasOwnProperty(key)) {
			   isProfileUpdated = values[key].profileUpdate;
                   	   myname = values[key].name; myemail = s.val().email;
		        //   alert(myname);
			}
		     }
		
  	    	     userDets = {name: myname, email: myemail, profileUpdate:isProfileUpdated};
		     load('home');
		     welcomeArea.classList.remove('hide');
	  	     welcomeArea.innerHTML= "Welcome "+ userDets.name; //user.email.split('@')[0]+ "";  //dot something
	 
	    	     if(!isProfileUpdated){
    		        var answer = confirm('Will you like to complete your user profile?');
		        if(answer)
		          load('updateProfile');
   	    	     } 

		  }
	        });
	    	
	     } else {var x = 1; }

	  }
	  console.log("Login successful "+user);  		// what of creating sessions etc?
	  loginBox.classList.add('hide');
 	  btnLogout.classList.remove('hide');

	  txtPassword.value = "";
	  txtEmail.value = "";
	} else{
	    loggedIn = false;
	    console.log('Logged out');
	    loginBox.classList.remove('hide');
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

function createPost() {
    if(!loggedIn) {
	alert("Please signup or log in to add post");
    }else{

      var t = document.getElementById('title').value.trim();
      var d = document.getElementById('description').value.trim();
      var c = document.getElementById('category').value;
      var cN = document.getElementById('cName').value.trim();
      var e = document.getElementById('usrEmail').value.trim();
      var o = userDets.name; // user.email.split('@')[0];
      var da;
      if(mode == 0) da = new Date().toGMTString();

      var post = {title:t, description:d, category:c, cName:cN, email:e, owner:o, consultant:'', date:da};

      if (t.length > 0 && d.length > 0) {
        savePostToDb(post);
      } else alert("Title or Description are entered incorrectly");
  
      clearForm();
      load('home');
      alert('Post added');
    }
};

function clearForm(){
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('cName').value = '';
    document.getElementById('usrEmail').value = '';
}

function savePostToDb(post){ 

    if(mode == 0){
      postsRef.push({
          title:post.title, description:post.description, category:post.category, cName:post.cName, email:post.email, owner:post.owner, consultant:"", date:post.date
      });
    }else{  //mode == key
        postsRef.child(mode).update({    
            title:post.title, description:post.description, category:post.category, cName:post.cName, email:post.email, owner:post.owner
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

function genPosts(list) {  //need country, consultants, 
    var links = '';
    links += '<div class="groove postlist cell"><h1>' +list.title+ '</h1> by '+ list.cName+ ', country <br>';
    links += '<i>' +list.category+ '</i> '+ list.date + '<br><br>' ;
    links += 'Owner: '+ list.owner + ' <br>';
    links += 'Details: ' +list.description;

    if(user && (userDets.name.toLowerCase() == list.owner.toLowerCase())){
	links += '<br><a href="javascript:edit(\'' + list.key + '\',\'' + list.title + '\')">Edit</a> | ';
        links += '<a href="javascript:del(\'' + list.key + '\',\'' + list.title + '\')">Delete</a> | ';
        links += '<a id="markCompleteBtn" href="javascript:markComplete(\'' + list.key + '\')">Mark as complete</a></div>';    
    }else {
	links += '<br><a onclick="javascript:window.location.href =\'mailto:' + list.email +'?subject=Follow up on your Yanju Post&body=Details: ' + list.description +';\'">Send Email to consult</a>  ';
	//use user.emailVerified to know if you should send email

    }

  //  if(list.consultant && list.consultant.length > 0)  links += '<br>' +list.consultant + ' is the Consultant who solved this case';

    return links;
};

function edit(key, title) {
    mode = key;
    load('edit');
/*
    document.getElementById('title').value = allPosts[key].title;
    document.getElementById('description').innerHTML = allPosts[key].description;
  //  document.getElementById('category').selectedIndex = allPosts[key].category; //switch from text to number
    document.getElementById('cName').value = allPosts[key].cName;
    document.getElementById('usrEmail').value = allPosts[key].email;    
*/
 //   document.getElementById('createPostModal').style.display = "block";
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

  // var consultant = prompt("Name of consultant who solved this case?", "");

}

function completePost(){
   var c = document.getElementById('consultant');
   var rating = document.getElementById('rating');
   var solution = document.getElementById('solution');  

   mode = document.getElementById('key').value; 
   var ind = "'/" +key+"/cName'";  //'/-KrWHx2ZAYoTKnrr9mKW/cName'
   if(consultant.length > 0){
	postsRef(key).set({ 
	   consultant: c
  	});

  /*	postsRef.update({
	 '/-KrWHx2ZAYoTKnrr9mKW/consultant' : c,
 	})  */
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

function searchPosts() { //switch to define list before loadallposts then use list and not allposts here
   var text = document.getElementById('searchText').value.trim().toLowerCase();
   var filter = document.getElementById('searchCtr').value.trim();
   var newList= [];
   var add = false;

   for(var key in allPosts) {
       if(filter == 'title'){
	   if (allPosts.hasOwnProperty(key) && allPosts[key].title && allPosts[key].title.toLowerCase().includes(text)) add = true;		
       } else if(filter == 'cName'){
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

    if(localhost)
	list = [{title: "Risk analysis", description:"Conduct analysis before running with year finance plan", category:'finance plan', cName:'Onefi', email:'alextsado@gmail.com', owner:'alextsado'},
                {title: "Help raise money", description:"We will soon go to VCs for series A funding, we don't know what to expect.", category:'finance plan', cName:'Lidya', email:'sade@uju.com', owner:'Sade'},
                {title: "Entering new market with payment app", description:"preparing to launch in Kenya after success in Nigeria. Help", category:'Market Plan', cName:'Lidya', email:'sade@uju.com', owner:'Sade'}
               ];
    else{
      for (var key in allPosts) {
        if (allPosts.hasOwnProperty(key)) {
            var t = allPosts[key].title ? allPosts[key].title : '';
            var d = allPosts[key].description ? allPosts[key].description : '';
            var c = allPosts[key].category ? allPosts[key].category : '';
            var cN = allPosts[key].cName ? allPosts[key].cName : '';
            var e = allPosts[key].email ? allPosts[key].email : '';
            var o = allPosts[key].owner ? allPosts[key].owner : '';
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
                    key: key
                })
            }
        }
      }
    }

    refreshUI2(list.reverse());
}

function loadMyPosts(){  //change to use owner and not cName
   var newList= [];
   var add = false;

   for(var key in allPosts) {
	if (allPosts.hasOwnProperty(key) && allPosts[key].cName && allPosts[key].cName.toLowerCase().includes("onefi")) {
	       newList.push({
		    description: allPosts[key].description ? allPosts[key].description : '',
		    title: allPosts[key].title ? allPosts[key].title : '',
		    cName: allPosts[key].cName ? allPosts[key].cName : '',
		    category: allPosts[key].category ? allPosts[key].category : '',
		    email: allPosts[key].email ? allPosts[key].email : '',
		    owner: allPosts[key].owner ? allPosts[key].owner : '',
		    date: allPosts[key].date ? allPosts[key].date : '',
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

//................navigation/ router
function clearAll(){   //see if you can display none body
   document.getElementById('home').display = 'none';
   document.getElementById('whyPage').display = 'none';
}

function show(page){
   load('home');
   
 //  if(page == 'home') document.getElementById('home').display = 'block';
   if(page == 'posts'){
      loadAllPosts();
   }else if(page == 'myposts'){
      loadMyPosts();
   } if(page == 'suggest'){
    //  document.getElementById('suggestModal').display = 'block';
   } //add an else with some error page
}


function load(page){
   var f = new XMLHttpRequest(); var file;
    
    if(page == 'profile') file = 'profile.html';
    else if(page == 'signup') file = 'signup.html';
    else if(page == 'blog') file = 'blog.html';
    else if(page == 'updateProfile') file = 'updateProfile.html';
    else if(page == 'createpost') 
	if(loggedIn) file = 'createpost.html';
	else alert("Please signup or log in to add post");
    else if(page == 'edit') 
	if(loggedIn) file = 'createpost.html';
	else alert("Please signup or log in to edit post");
    else file = 'home.html';

    f.open("GET", file, false);
    f.onreadystatechange = function ()
    {
        if(f.readyState === 4)
        {
            if(f.status === 200 || f.status == 0)
            {   
    		document.getElementById('main').innerHTML = f.responseText; 

		if(page == 'createpost')
       		   document.getElementById("usrEmail").value = user.email;
		else if(page == 'edit'){
		   var key = mode;
		   document.getElementById('title').value = allPosts[key].title;
		    document.getElementById('description').innerHTML = allPosts[key].description;
		  //  document.getElementById('category').selectedIndex = allPosts[key].category; //switch from text to number
		    document.getElementById('cName').value = allPosts[key].cName;
		    document.getElementById('usrEmail').value = allPosts[key].email;  
		}
            }
        }
    }
    f.send(null);

}
