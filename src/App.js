import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const app = new Clarifai.App({
    apiKey: 'e7a980aab1ad4c6397e1c10c5952d6df'
});

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

class App extends Component {
    constructor() {
        super();
        this.state = {
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
                createdAt: ''
            }
        }
    }
    loadUser = user => {
        const { id, name, email, entries, createdAt } = user;

        this.setState({
            user: {
                id,
                name,
                email,
                entries,
                createdAt
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
        app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
            .then(res => {
                if (res) {
                    fetch('http://localhost:3000/image', {
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
                }
                this.displayFaceBox(this.calculateFaceLocation(res))
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
            this.setState({ isSignedIn: false });
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
