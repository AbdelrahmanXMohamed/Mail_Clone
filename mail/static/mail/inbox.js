
document.addEventListener('DOMContentLoaded', function () {
  console.log("loaded")

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  get_allmails();
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector("#compose-form").onsubmit = function () {
    fetch("/emails", {
      method: "POST",
      body:
        JSON.stringify({
          "recipients": document.querySelector("#compose-recipients").value,
          "subject": document.querySelector("#compose-subject").value,
          "body": document.querySelector("#compose-body").value,
        })
    }).then(response => response.json()).then(function (data) {
      console.log(data)
      load_mailbox('sent');
    });
    return false;
  }
    ;

}




function get_allmails() {
  fetch(`/emails/sent`).then(response =>
    response.json()).then(data => console.log(data))

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;






}