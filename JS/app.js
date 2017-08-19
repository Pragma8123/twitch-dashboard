var debug = true; // Setting for all testing to be switched on; change to false once we are finished

// WARNING: Need to take this out of the client when we are ready to deploy!!!
const twitchClientId = '';


/*
***** Global Components *****
*/

// <modal>
Vue.component('modal', {
  template: '#modal-template'
});

/*
***** End Global Components *****
*/

/*
***** Sub-Components *****
*/

// <custom-header>
var customHeader = {
  template: '#custom-header-template',
  methods: {
    changeContent: function(content) {
      if (debug)
        console.log("changeContent(" + content + ")");
      this.$emit('change-content', content);
    }
  }
};

// <custom-content>
var customContent = {
  template: '#custom-content-template',
  props: {
    content: {
      type: String,
      required: true
    }
  },
  components: {
    'live-streams': {
      template: '#live-streams-template'
    },
    'clips': {
      template: '#clips-template'
    },
    'videos': {
      template: '#videos-template'
    },
    'twitch-top': {
      template: '#twitch-top-template'
    }
  }
};

/*
***** End Sub-Components *****
*/

var app = new Vue({
  el: '#app',
  data: {
    header: 'Twitch Dashboard!',
    body: {
      content: ''
    },
    modalText: {
      heading: 'Twitch Username Needed',
      body: 'Please enter your Twitch Username to use the app!',
      inputFieldVisible: true
    },
    showModal: true,
    localUser: {
      twitchUsername: String,
      twitchUserId: String,
      follows: Array,
      followStreams: Array
    }
  },
  components: {
    'custom-header': customHeader,
    'custom-content': customContent
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
          // Close the modal after we're done with basic setup
          this.showModal = false;
        })
        .catch(error => {
          if (debug) {
            console.log(error);
          }
        })
    },

    /**
    * Check channels for any active live streams
    * @param {string} channels - A comma-separated list of channel IDs to Check
    * @param {number} count - Maximum amount of results
    */
    getLiveStreams: function(channels, count) {
      axios({
        method: 'get',
        url: 'https://api.twitch.tv/kraken/streams/',
        headers: {
          'Client-ID': twitchClientId,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        params: {
          channel: channels,
          language: 'en',
          stream_type: 'live',
          limit: count
        }
      })
        .then(response => {
          this.localUser.followStreams = response.data.streams;
          if (debug) {
            console.log(response.data._total + ' follows are live-streaming');
          }
        })
        .catch(error => {
          if (debug) {
            console.log(error);
          }
        })
    },
    changeContent: function(content) {
      if (debug)
        console.log(content);
      this.body.content = content;
    }
  }
})
