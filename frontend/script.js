// const API_URL = "http://localhost:3000/"

$("#bd").ready(() => {$("#load").load("pages/authentication/login.html");});

var body = document.getElementById("bd");
body.addEventListener('load', () => {$("#load").load("pages/authentication/login.html");});



// function login(){
//   $("#load").load("pages/dashboard/dashboard.html");
// }

function test(){
  $("#load").load("pages/book/list/list_book.html");
}

function test2(){
  $("#load").load("pages/book/forms/review_book_form.html");
}

function test3(){
  $("#load").load("pages/book/forms/create_book_form.html");
}

function test4(){
  $("#load").load("pages/administrator/list_users.html");
}

function test5(){
  $("#load").load("pages/list/list_book.html");
}

function test6(){
  $("#load").load("pages/book/list/list_borrowed_books.html");
}

function data(){
  $("#load").load("pages/user/profile.html");
}

function registerPageLoad()
{
	$("#load").load("pages/authentication/register.html");
}