# trumpeter-db
This repo contains all code related to the backend of the Android application Trumpeter. This includes the MongoDB database, Node.js API
and backend, server code, relational data model, and more.

Built by jessethd with Node.js, Express, and Mongoose.

## Main Files:

**```routes.js```:** Home of the REST API. Receives HTTP requests at various routes, facilitating retrieval, update, creation, and
deletion of trumpet and retrumpet data. This file also contains the calls for user account creation and login, done securely with
Passport and methods defined in the Mongoose 'User' model. These account management routes return a JSON web token representing the
current user and session.

**```server.js```:**
Home of main Node server code. Initializes middleware and connects to Mongo database through Mongoose.

**```config/passport.js```:**
Defines the local strategy for Passport, which handles user account authentication. Uses security methods defined under the Mongoose
'User' model to check password validity and returns an answer to the API.

**```models```:**
This directory contains files that define Mongoose schemas for collections in the database and functions that work on the data in those
schemas. ```user.js``` defines ```setPassword``` and ```validPassword```, which use pbkdf2 from Express's Crypto module to generate a 
salt and hash from a given password and test a given password on a user's salt and hash, respectively. Also defined in this file is 
```generateJWT```, which creates a JSON web token for a given user session containing all necessary info about the currently logged in 
user.


## MongoDB Implementation

Trumpeter utilizes relatively simple logic to retrieve, create, and update data, allowing for an intuitive and lightweight
implementation in non-relational database technology. Additional data model and implementation details (types, default values, 
functions, etc) can be found within Mongoose files for each collection in the ```models``` directory.

**User collections** contain all user data. Salts and hashes are utilized with Node's built in crypto and pbkdf2 for user 
authentication; no sensitive information is stored in the database. User documents are of varying schemas depending on information 
provided by the user. One per user.


```
user (
    _id: ObjectId(x), 
    user_info_id: ObjectId(x),
    email_addr: dumbo@gmail.com,
    username: 'BigEars',
    profile_picture: elephant_photo.jpg,
    hash: someHash,
    salt: someSalt
)
```

**UserInfo collections** contain only user information necessary for public display on Trumpets. Referenced within trumpet and retrumpet 
documents for data consistency and efficiency purposes.  One per user.

```
user_info (
     _id: ObjectId(x),
     username: 'BigEars',
     profile_picture: elephant_photo.jpg
)
```

**Trumpet collections** are generally represented in this format:

```
trumpet (
     _id: ObjectId(x),
     user_info_id: ObjectId(y),
     reply_trumpet_id: null OR ObjectId(r), 
     submit_time: 2/23/2015 11:55:36,
     text: 'I am the coolest elephant',
     likes: 5,
     retrumpets: 2,
     replies: 20
)
```

User information documents are referenced within each trumpet document, containing only necessary info about the author of the trumpet. 
If the trumpet is a reply trumpet (was submitted as a reply to another trumpet), the reply_trumpet_id field serves as a reference to the
trumpet document that is being replied to. Otherwise, this field is not present. Only trumpets that are not replies are queried in the 
main feed of the application.

**Retrumpet collections** are generally represented in this format:

```
retrumpet (
      _id: ObjectId(x),
      trumpet_id: ObjectId(y),
      retrumpeter_username: 'Mr. Elephant'
)
```

A reference to the trumpet document that is being retrumpeted (copied) is contained within retrumpet documents. Retrumpets of both 
regular trumpets and reply trumpets are queried in the main feed. A retrumpet document contains only two additional fields, the unique
id and the username of the user that created the retrumpet. NOTE: trumpet data is normalized (NOT embedded) within retrumpet documents 
to facilitate more efficient updating of trumpet data (only required to update one original trumpet document, and not all of its 
retrumpets), and to ensure that updating is an atomic operation. Non-normalizing the retrumpet model, that is, embedding trumpet data 
within retrumpet documents, provides for more efficient queries by removing the extra trumpet lookup from each retrumpet query. 
Atomicity and efficiency of update is preferable in this case.



## Relational Data Model:
Relationally, the database is built around four entities: Users, UserInfo, Trumpets, and ReTrumpets. Trumpet entities can also be split
into two separate categories: Trumpets and ReplyTrumpets. The diagram below contains additional details regarding types and relations.

<a href="url"><img src="http://i.imgur.com/eKtoAY0.png"></a>
*Note: A few details in this diagram are currently outdated; treat it as a general picture of the model and its relationships. Refer to text below and Mongo implementation for current attribute details*



**User entities** in the system possess 6 attributes: 5 required, 1 optional: 
* user_id (PK)
* user_info_id (FK)
* email_addr
* username 
* password
* profile_picture (nullable)

**UserInfo entities** in the system possess 3 attributes: 2 required, 1 optional:
* user_info_id (PK)
* username
* profile_picture (nullable)

**Trumpet entities** have 8 attributes: 7 required, 1 optional:
* trumpet_id (PK)
* user_info_id (FK)
* reply_trumpet_id (FK) (nullable)
* submit_time
* text
* likes
* retrumpets
* replies

**Retrumpet entities** have only 3 attributes: 2 required, 1 optional:
* retrumpet_id (PK)
* trumpet_id (FK)
* retrumpeter_username

**Users** currently contain only basic account management information.

**UserInfo** contain only user information necessary for public display on Trumpets.

**Trumpets** contain a foreign key reference to the posting user under user_id. Additionally, if the Trumpet is a reply Trumpet (that
is, it was submitted as a reply to another Trumpet), it will contain a foreign key reference to the trumpet_id that is being replied to
under the foreign key reply_trumpet_id.

**Retrumpets** are "copies" of Trumpets that can be resubmitted into the system by users. As such, retrumpets share all data values
(likes, replies, etc) with the copied trumpet, and only consist of a unique retrumpet_id and the id of the "retrumpeter", user_id.


