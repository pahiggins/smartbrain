import React, { Component } from 'react';
import Particles from 'react-particles-js';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const particlesOptions = {
    particles: {
        number: {
            value: 30,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
};

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        created: ''
    }
};

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }
    loadUser = user => {
        const { id, name, email, entries, created } = user;

        this.setState({
            user: {
                id,
                name,
                email,
                entries,
                created
            }
        });
    }
    onInputChange = (event) => {
        this.setState({
            input: event.target.value
        });
    }
    onButtonSubmit = () => {
        this.setState({
            imageUrl: this.state.input
        });
        fetch('https://smartbrain-api-pah.herokuapp.com/imageurl', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(res => res.json())
            .then(res => {
                if (res) {
                    fetch('https://smartbrain-api-pah.herokuapp.com/image', {
                        method: 'put',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response => {
                            return response.json();
                        })
                        .then(count => {
                            this.setState(Object.assign(this.state.user, { entries: count }));
                        })
                        .catch(err => console.log(err));
                }
                this.displayFaceBox(this.calculateFaceLocation(res));
            })
            .catch(err => console.log(err));
    }
    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('input-image');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }
    displayFaceBox = (box) => {
        this.setState({ box });
    }
    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState);
        } else if (route === 'home') {
            this.setState({ isSignedIn: true });
        }
        this.setState({ route });
    }
    render() {
        const { isSignedIn, box, imageUrl, route } = this.state;

        return (
            <div className="App">
                <Particles
                    className="particles"
                    params={particlesOptions}
                />
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
                {route === 'home'
                    ?
                        <div>
                            <Logo />
                            <Rank name={this.state.user.name} entries={this.state.user.entries} />
                            <ImageLinkForm
                                onInputChange={this.onInputChange}
                                onButtonSubmit={this.onButtonSubmit}
                            />
                            <FaceRecognition box={box} imageUrl={imageUrl} />
                        </div>
                    :
                        (
                            route === 'signin'
                                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                        )
                }
            </div>
        );
    }
}

export default App;
