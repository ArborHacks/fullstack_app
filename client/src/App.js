// /client/App.js
import React, { Component } from "react";
import Dropzone from 'react-dropzone';
import Firebase, {auth, provider} from './config';
import axios from "axios";

class App extends Component {
  // initialize our state 
  state = {
    data: [],
    id: 0,
    message: null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null,
    objectToUpdate: null
  };

  constructor(props) {
		super(props);
		
		this.state = {
			user: null,
			file: [],
			submits: []
		}
		
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.onFileDrop = this.onFileDrop.bind(this);
	}
	
	componentDidMount() {
		const submitRef = Firebase.database().ref('submits');
		submitRef.on('value', (snapshot) => {
			let submits = snapshot.val();
			let newState = [];
			for(let submission in submits) {
				newState.push({
					id: submission,
					user: submits[submission].user,
					score: submits[submission].score,
					time: submits[submission].time
				});
			}
			this.setState({
				submits: newState
			});
		});
	}
	
	logout() {
		auth.signOut()
			.then(() => {
				this.setState({
					user: null
				});
			});
	}
	
	login() {
		auth.signInWithPopup(provider)
			.then((result) => {
				var token = result.credential.accessToken;
				const user = result.user;
				this.setState({user});
			}).catch(function(error){
				var errorCode = error.code;
				var errorMessage = error.message;
				var email = error.email;
				var credential = error.credential;
			});
	}
	
	onFileDrop = (files) => {
		this.setState({file: files})
		var fileType = files[0].name.slice(files[0].name.lastIndexOf("."));
		let score = 0;
		if(fileType === ".cpp") {
			//Run C++ autograder, get score in score
		}
		else if(fileType === ".java") {
			//Run Java autograder, get score in score
		}
		var key = this.state.user.email.slice(0, this.state.user.email.indexOf("@"));
		var today = new Date();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "." + today.getMilliseconds();
		const submitRef = Firebase.database().ref('submits');
		const submission = {
			user: key,
			time: time,
			score: score
		}
		let submitID = "";
		for(let teamSubmit in this.state.submits) {
			if(this.state.submits[teamSubmit].user === key) {
				submitID = this.state.submits[teamSubmit].id;
				break;
			}
		}
		if(submitID === "") {
			submitRef.push(submission);
		}
		else {
			let submits = this.state.submits;
			const index = submits.findIndex(data => {
				return data.id === submitID
			});
			if(this.state.submits[index].score < score) {
				Firebase.database().ref('submits/' + submitID).update({
					score: score,
					time: time
				});
			}
		}
	}
	
  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has 
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // never let a process live forever 
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object 
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify 
  // data base entries

  // our first get method that uses our backend api to 
  // fetch data from our data base
  getDataFromDb = () => {
    fetch("http://localhost:3001/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

  // our put method that uses our backend api
  // to create new query into our data base
  putDataToDB = message => {
    let currentIds = this.state.data.map(data => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post("http://localhost:3001/api/putData", {
      id: idToBeAdded,
      message: message
    });
  };


  // our delete method that uses our backend api 
  // to remove existing database information
  deleteFromDB = idTodelete => {
    let objIdToDelete = null;
    this.state.data.forEach(dat => {
      if (dat.id === idTodelete) {
        objIdToDelete = dat._id;
      }
    });

    axios.delete("http://localhost:3001/api/deleteData", {
      data: {
        id: objIdToDelete
      }
    });
  };


  // our update method that uses our backend api
  // to overwrite existing data base information
  updateDB = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null;
    this.state.data.forEach(dat => {
      if (dat.id === idToUpdate) {
        objIdToUpdate = dat._id;
      }
    });

    axios.post("http://localhost:3001/api/updateData", {
      id: objIdToUpdate,
      update: { message: updateToApply }
    });
  };


  // here is our UI
  // it is easy to understand their functions when you 
  // see them render into our screen
  render() {
	return (
		<div className='app'>
			<header>
				<div>
					<h1>And Then There Were NULL</h1>
				</div>
			</header>
			{this.state.user ?
				<div>
					<div>
						<p>Welcome {this.state.user.displayName}!</p>
						<p>When you are done, click the button below to log out.</p>
						<button onClick={this.logout}>Log Out</button>
					</div> 
					<div>
						<Dropzone 
							accept='.cpp,.java'
							onDropAccepted={this.onFileDrop}
							multiple={false}
						>
							{({getRootProps, getInputProps}) => (
								<section>
									<div {...getRootProps()}>
										<input {...getInputProps()} />
										<p><b>Drag and drop your program file here, or click this text to select a file</b></p>
									</div>
								</section>
							)}
						</Dropzone>
					</div>
				</div>
				: <div>
					<p>Welcome to the 2019 ArborHacks coding competition!</p>
					<p>Please click the button below to log in with your Google account.</p>
					<button onClick={this.login}>Log In</button>
				</div>
			}
		</div>
	);
}
}

export default App;