const API_URL = "http://localhost:3000"
       
function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie);
  const cArr = cDecoded.split('; ');
  let res;
  cArr.forEach(val => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  })
  return res
} 

async function createBook(formData)
{
	  var xhr = new XMLHttpRequest();
	  xhr.open("POST", API_URL + "/library/books/create", true);
	  xhr.setRequestHeader("Content-Type", "application/json");
	  xhr.onreadystatechange = function() {
		  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
		    var response = JSON.parse(xhr.responseText);
		    return response;
		  }
	  };
	  xhr.send(formData);
      //redirect
      // window.location.reload();
}

function createBookReview(formData,book_id)
{
	var xhr = new XMLHttpRequest();
	xhr.open("POST", API_URL + "/books/review/book/" + book_id, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	    var response = JSON.parse(xhr.responseText);
	    return response;
	  }
	};
	xhr.send(formData);
	//redirect
}

function borrowBook(book_id)
{
	var formData = {
		book_id: book_id,
		user_id: document.cookie.user_id
	}
	var xhr = new XMLHttpRequest();
	xhr.open("POST",API_URL + "/books/borrow/" + book_id,true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	    var response = JSON.parse(xhr.responseText);
	    return response;
	  }
	};
	xhr.send(formData);
	//redirect

}

arsync function listBorrowedBooks()
{
	try {
    const response = await fetch(API_URL + "/books/borrowed/list");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function listBooks()
{
	try {
    const response = await fetch(API_URL + "/library/books");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function login(formData) {
  try {
    const response = await fetch(API_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: formData
    });
    const data = await response.json();
    if(data.success === true)
    {
    	document.cookie="user_id="+data.user_id;
    	document.cookie="user_role="+data.user_role
  		$("#load").load("pages/dashboard/dashboard.html");
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function guestLogin()
{

document.cookie="user_role=guest";
	window.location.reload();
}

function adminlogin(formData)
{
	var xhr = new XMLHttpRequest();
	xhr.open("POST",API_URL + "/admin/login",true);
	xhr.setRequestHeader("Content-Type","application/json");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	    var response = JSON.parse(xhr.responseText);
	    return response;
	  }
	};
	xhr.send(formData);
	//redirect
}

async function register(formData) {
  try {
    const response = await fetch(API_URL + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: formData
    });
    const data = await response.json();
    if(data.success === true)
    {
  		// $("#load").load("pages/authentication/login.html");
  		window.location.reload();
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

function logout()
{
	// var xhr = new XMLHttpRequest();
	// xhr.open("POST",API_URL + API_URL + "/logout",true);
	// xhr.onreadystatechange = function() {
	//   if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	//     var response = JSON.parse(xhr.responseText);
	//     return response;
	//   }
	// };
	// xhr.send();
	// window.location.href = "pages/dashboard/dashboard.html";
	document.cookie="user_id=;expires=" + new Date(0).toUTCString()
	document.cookie="user_role=;expires=" + new Date(0).toUTCString()
	window.location.reload();
}


async function listUsers()
{
	try {
    const response = await fetch(API_URL + "/user/list");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }

}

function deleteUser(user_id)
{
	var xhr = new XMLHttpRequest();
	xhr.open("DELETE", API_URL + "/user/delete", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	    var response = JSON.parse(xhr.responseText);
	    return response;
	  }
	};
	xhr.send(JSON.stringify({ user_id: user_id }));
}

function updateUserProfile(formData,user_id)
{
	var xhr = new XMLHttpRequest();
	xhr.open("PUT", API_URL + "/profile/settings/" + user_id, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	    var response = JSON.parse(xhr.responseText);
	    return response;
	  }
	};
	xhr.send(formData);
}


async function getProfileInfo()
{
	try {
    const response = await fetch(API_URL + "/profile/info?user_id="+getCookie('user_id'));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}