var debug = true; // Setting for all testing to be switched on; change to false once we are finished

// WARNING: Need to take this out of the client when we are ready to deploy!!! 
const twitchClientId = '';

Vue.component('modal', {
  template: '#modal-template'
})

var app = new Vue({
  el: '#app',
  data: {
    header: 'Twitch Dashboard!',
    modalText: {
      heading: 'Twitch Username Needed',
      body: 'Please enter your Twitch Username to use the app!',
      inputFieldVisible: true
    },
    showModal: true,
    localUser: {
      twitchUsername: ''
    }
  },
  methods: {
    captureTwitchId: function() {
      var twitchIdInput = document.getElementById('twitchid');
      this.localUser.twitchUsername = twitchIdInput.value;
      if (debug)
        console.log(this.localUser.twitchUsername);
      this.getUserId(this.localUser.twitchUsername);
    },
    getUserId: function(user) { // Twitch API Client Id and Username need to be passed in
      axios({
        method:'get',
        url:'https://api.twitch.tv/kraken/users',
        headers: {
          'Client-ID': twitchClientId,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        params: {
          login: user
        }
      })
        .then(response => {
          this.localUser.twitchUserId = response.data.users[0]._id;
          if (debug) {
            console.log(this.localUser.twitchUserId);
          }
          this.modalText.inputFieldVisible = false;
          this.modalText.heading = 'Hello ' + this.localUser.twitchUsername + '!';
          this.modalText.body = 'We are setting up your dashboard right now...';
        })
        .catch(error => {
          if(debug){
            console.log(error);
          }
          this.modalText.heading = 'Twitch Username Not Found!';
          this.modalText.body = 'Try again!';
        })
    }
  }
})

