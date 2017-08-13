var debug = true; // Setting for all testing to be switched on; change to false once we are finished

// WARNING: Need to take this out of the client when we are ready to deploy!!!
const twitchClientId = '';

Vue.component('modal', {
  template: '#modal-template'
});

Vue.component('custom-header', {
  template: '#custom-header-template'
});

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
      twitchUsername: '',
      twitchUserId:'',
      follows: []
    }
  },
  methods: {
    captureTwitchId: function() {
      var twitchIdInput = document.getElementById('twitchid');
      twitchIdInput.disabled = true;
      document.getElementById('twitchid-button').disabled = true;
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
          // Let's start with 5 follows
          this.getFollowList(this.localUser.twitchUserId);
          this.modalText.inputFieldVisible = false;
          this.modalText.heading = 'Hello ' + this.localUser.twitchUsername + '!';
          this.modalText.body = 'We are setting up your dashboard right now...';
        })
        .catch(error => {
          if(debug) {
            console.log(error);
          }
          this.modalText.heading = 'Twitch Username Not Found!';
          this.modalText.body = 'Try again!';
          document.getElementById('twitchid').disabled = false;
          document.getElementById('twitchid-button').disabled = false;
        })
    },
    getFollowList: function(userId, count) { // Twitch API Client-ID, User Id, and follows count
      axios({
        method: 'get',
        url: 'https://api.twitch.tv/kraken/users/' + userId + '/follows/channels',
        headers: {
          'Client-ID': twitchClientId,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        params: {
          limit: count
        }
      })
        .then(response => {
          this.localUser.follows = response.data.follows;
          if (debug) {
            console.log(response.data._total + ' followed channels');
          }
        })
        .catch(error => {
          if (debug) {
            console.log(error);
          }
        })
    }
  }
})
