
document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  console.log(document.querySelector("#compose-form"))
  document.querySelector("#compose-form").onsubmit = (e) => {
    send_mail()

    e.preventDefault();

    document.querySelector("#sent").click()
  };

}
/*
Send Mail:
When a user submits the email composition form, add JavaScript code to actually send the email.
  1.You’ll likely want to make a POST request to /emails, passing in values for recipients, subject, and body.
  2.Once the email has been sent, load the user’s sent mailbox.
*/

function send_mail() {

  fetch("/emails", {
    method: "POST",
    body:
      JSON.stringify({
        "recipients": document.querySelector("#compose-recipients").value,
        "subject": document.querySelector("#compose-subject").value,
        "body": document.querySelector("#compose-body").value,
      })
  }).then(response => response.json()).then(function (data) {
    console.log(data.message)
  });
}



/*
Mailbox: 
When a user visits their Inbox, Sent mailbox, or Archive, load the appropriate mailbox.
  1.You’ll likely want to make a GET request to /emails/<mailbox> to request the emails for a particular mailbox.
  2.When a mailbox is visited, the application should first query the API for the latest emails in that mailbox.
  3.When a mailbox is visited, the name of the mailbox should appear at the top of the page (this part is done for you).
  4.Each email should then be rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
  5.If the email is unread, it should appear with a white background. If the email has been read, it should appear with a gray background.
*/

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log(mailbox)
  fetch(`/emails/${mailbox}`).then(response =>
    response.json()).then(data => {
      var comp = document.createElement("div")
      comp.setAttribute("id", "app")
      comp.setAttribute("class", "list-group")
      console.log(data)

      for (var mail of data) {

        if (mailbox == 'inbox' && !mail.archived)
          comp.innerHTML += `<li class="list-group-item" style="${mail.read ? "color:grey;background: rgba(0,0,0,0.08)" : ""}" >
          <strong  onclick="load_email(${mail.id})">${mail.sender}</strong>
          ${mail.subject}
          <span style="float:right">         
          ${mail.timestamp}
          <button class="btn btn-sm btn-outline-primary" onclick="archive(${mail.id})" id="archive">Archive</button>
          </span></li>`
        else if (mailbox == 'archive' && mail.archived) {
          console.log(mail.archived)
          comp.innerHTML += `<li class="list-group-item" style="${mail.read ? "color:grey;background: rgba(0,0,0,0.08)" : ""}" >
          <strong  onclick="load_email(${mail.id})">${mail.sender}</strong>
          ${mail.subject}
          <span style="float:right">         
          ${mail.timestamp}
          <button class="btn btn-sm btn-outline-danger" id="unarchive"  onclick="archive(${mail.id})" >Unarchive</button>
          </span></li>`
        }
        else {
          comp.innerHTML += `<li class="list-group-item" >
          <strong onclick="load_email(${mail.id})">${mail.recipients[0]}</strong>
           <span onclick="load_email(${mail.id})">${mail.subject}</span>
          <span style="float:right">
          <button class="btn btn-out"
          ${mail.timestamp}
          </span></li>`}
      }
      document.querySelector("#emails-view").appendChild(comp)
    })
}
/*
  View Email:
  When a user clicks on an email, the user should be taken to a view where they see the content of that email.
    1.You’ll likely want to make a GET request to /emails/<email_id> to request the email.
    2.Your application should show the email’s sender, recipients, subject, timestamp, and body.
    3.You’ll likely want to add an additional div to inbox.html (in addition to emails-view and compose-view) for displaying the email. Be sure to update your code to hide and show the right views when navigation options are clicked.
    4.See the hint in the Hints section about how to add an event listener to an HTML element that you’ve added to the DOM.
    5.Once the email has been clicked on, you should mark the email as read. Recall that you can send a PUT request to /emails/<email_id> to update whether an email is read or not.
*/
function load_email(e) {

  document.querySelector("#emails-view").innerHTML = ''

  fetch(`/emails/${e}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      var comp = document.createElement("div");
      comp.innerHTML =
        `
      <p><strong>From:</strong>${email.sender}</p>
      <p><strong>To:</strong>${email.recipients.map((e) => e + ", ")}</p>      
      <p><strong>Subject:</strong>${email.subject}</p>      
      <p><strong>Timestamp:</strong>${email.timestamp}</p>
      <button class="btn btn-sm btn-outline-primary" id="reply">Relay</button>
      <hr/>
      <p>${email.body}</p>
      `
      document.querySelector("#emails-view").appendChild(comp)
      document.querySelector("#reply").addEventListener("click",
        () => {
          relay(email)
        }
      )
      if (!email.read)
        fetch(`/emails/${e}`, {
          method: "PUT",
          body:
            JSON.stringify({ ...email, read: true })
        }).then(response => response.json())
          .then(result => {
            // Print result
            console.log(result);
          });
    });
}
/* 
  Reply: 
  Allow users to reply to an email.
    1.When viewing an email, the user should be presented with a “Reply” button that lets them reply to the email.
    2.When the user clicks the “Reply” button, they should be taken to the email composition form.
    3.Pre-fill the composition form with the recipient field set to whoever sent the original email.
    4.Pre-fill the subject line. If the original email had a subject line of foo,
     the new subject line should be Re: foo. (If the subject line already begins with Re: , no need to add it again.)
    5.Pre-fill the body of the email with a line like "On Jan 1 2020, 12:00 AM foo@example.com wrote:" followed by the original text of the email.

*/
function relay(email) {



  document.querySelector("#emails-view").innerHTML = '';
  compose_email();
  // Relay
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = email.subject.slice(0, 3) === 'Re:' ? `${email.subject}` : `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} `


}
/*
Archive and Unarchive:
Allow users to archive and unarchive emails that they have received.
    1.When viewing an Inbox email, the user should be presented with a button that lets them archive the email. When viewing an Archive email, the user should be presented with a button that lets them unarchive the email. This requirement does not apply to emails in the Sent mailbox.
    2.Recall that you can send a PUT request to /emails/<email_id> to mark an email as archived or unarchived.
    3.Once an email has been archived or unarchived, load the user’s inbox.

*/
function archive(e) {

  fetch(`/emails/${e}`)
    .then(response => response.json())
    .then(email => {
      fetch(`/emails/${e}`, {
        method: "PUT",
        body:
          JSON.stringify({ ...email, archived: !email.archived })
      }).then(response => response.json())
        .then(result => {
          // Print result
          console.log(result);
        });
    });

}