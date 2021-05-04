import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const CheckboxLabel = styled.label`
  margin-top: 5px;
  margin-bottom: 5px;
  margin-right: 50px;
`;
const Button = styled.button`
  font-family: 'Montserrat', sans-serif;
  background: white;
  border-radius: 3px;
  border: 3px solid #00b1cc;
  background-color: #121640;
  color: #ee3ec9;
  margin-top: 40px;
  margin-bottom: 40px;
  padding: 0.25em 1em;
  font-size: 20px;
  border-radius: 8px;
`;
const HomeStyles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #121640;
  ${Button}:hover {
    background-color: #1b215f;
  }
  ....
`;
const HomeStylesLeftAlign = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #ff0080;
`;

const Checkbox = ({ type = 'checkbox', name, checked, onChange }) => (
    <input type={type} name={name} checked={checked} onChange={onChange} />
);
    
Checkbox.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
}
    
class CheckboxContainer extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            checkedItems: new Map(),
            pressed: false,
            finished: false
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.postPlaylists = this.postPlaylists.bind(this);
        this.finishCheckbox = this.finishCheckbox.bind(this);
    }
    
    finishCheckbox() {
        this.props.onSubmit();
    }

    postPlaylists() {
        this.setState({pressed: true});
    
        const checkedItems = this.state.checkedItems;
        const propItems = this.props.checkboxes;
        var data = {}
    
        var checkedPlaylists = {};
    
        for (const playlist of Object.entries(propItems)) {
            if(checkedItems.get(playlist[1].name)){
                checkedPlaylists[playlist[1].name] = playlist[1].data;
            }
        }
        
        data.playlists = checkedPlaylists;
        data.token = this.props.userToken;
        var string = JSON.stringify(data);
    
        // POST
        fetch('/post_playlists', {
            // Declare what type of data we're sending
            headers: {
            'Content-Type': 'application/json'
            },
            // Specify the method
            method: 'POST',
            // A JSON payload
            body: string
        }).then(function (response) { // At this point, Flask has printed our JSON
            return response.text();
        }).then(function (text) {
            console.log('POST response: ');
            // Should be 'OK' if everything was successful
            console.log(text);
            this.setState({finished: true});
            this.finishCheckbox();
        }.bind(this));
    }
  
    handleChange(e) {
        const item = e.target.name;
        const isChecked = e.target.checked;
        this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
    }
  
    render() {
        return (
            <div>
            {!this.state.pressed && (
            <React.Fragment>
                <HomeStyles>
                    <HomeStylesLeftAlign>
                        {
                        this.props.checkboxes.map(item => (
                            <CheckboxLabel key={item.name}>
                                <Checkbox name={item.name} checked={this.state.checkedItems.get(item.name)} onChange={this.handleChange}/>
                                <strong>{item.name+": "}</strong>{item.length+" songs"}
                            </CheckboxLabel>
                        ))
                        }
                    </HomeStylesLeftAlign>
                    <Button onClick={this.postPlaylists}>
                        Create Playlists
                    </Button>
                </HomeStyles>
            </React.Fragment>
            )}
            {this.state.pressed && (
                <p class="loading">Creating playlists</p>
            )}
        </div>
        );
    }
}

export default CheckboxContainer;
