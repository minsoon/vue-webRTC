<template>
  <div class="userLayout">
    <div class="confirm" v-show="!video">
      <p>연결하시겠습니까?</p>
      <v-btn dark color="#5cbbf6" @click="call">CALL</v-btn>
    </div>
    <div class="video" v-show="video">
      <video class="rounded centered" id="myvideo" autoplay playsinline muted="muted"/>
      <video class="rounded centered" id="remotevideo" autoplay playsinline></video>
      <div class="txtBox">
        <ul>
          <li v-for="(item, index) in msgList" :key="index" :class="{p: item.type === 'p', a: item.type === 'a'}"><v-icon color="green" v-if="item.type === 'p'">mdi-account-circle</v-icon> {{item.text}} <v-icon color="#6a9aca" v-if="item.type === 'a'">mdi-account-circle</v-icon></li>
        </ul>
        <input type="text" value="test" v-model="text" placeholder="메시지를 입력해주세요." @keyup="checkEnter" />
        <div class="close">
          <v-btn depressed small color="error" @click="hangup">Hangup</v-btn>
        </div>
      </div>
    </div>
    <div class="dim" v-if="dim">
      <v-progress-circular
        indeterminate
        :width="3"
        color="#fff"
      ></v-progress-circular>
    </div>
  </div>
</template>

<script>
export default {
  name: 'User',
  data () {
    return {
      doSimulcast: null,
      spinner: null,
      video: false,
      dim: false,
      text: '',
      msgList: []
    }
  },
  methods: {
    hangup () {
      let hangup = { request: 'hangup' }
      this.$janus.send({ message: hangup })
      this.$janus.hangup()
      this.$router.push('/')
    },
    scrollBtm () {
      const container = document.querySelector('.txtBox ul')
      container.scrollTo(0, container.scrollHeight)
    },
    checkEnter (e) {
      if (e.code === 'Enter') {
        if (this.text === '') {
          return
        }
        this.$janus.data({
          text: this.text,
          success: () => {
            this.msgList.push({
              type: 'p',
              text: this.text
            })
            this.text = ''
            setTimeout(() => {
              this.scrollBtm()
            }, 10)
          }
        })
      }
    },
    call () {
      this.$janus.createOffer({
        media: { data: true },
        simulcast: this.doSimulcast,
        success: (jsep) => {
          window.Janus.debug('Got SDP!', jsep)
          let body = { request: 'call', username: 'manager' }
          this.$janus.send({ message: body, jsep: jsep })
        },
        error: (error) => {
          this.$janus.error('WebRTC error...', error)
        }
      })
    },
    getQueryStringValue (name) {
      let regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
      let results = regex.exec(location.search)
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
    },
    onlocal (stream) {
      window.Janus.attachMediaStream(document.getElementById('myvideo'), stream)
      document.getElementById('myvideo').muted = 'muted'
    }
  },
  mounted () {
    this.doSimulcast = (this.getQueryStringValue('simulcast') === 'yes' || this.getQueryStringValue('simulcast') === 'true')
    this.$eventBus.$on('onmessage', (stream) => {
      if (stream.msg.result.event === 'accepted' && stream.jsep) {
        this.$janus.handleRemoteJsep({ jsep: stream.jsep })
      }
      if (stream.msg.result.event === 'calling') {
        this.dim = true
      }
    })
    this.$eventBus.$on('onlocalstream', (stream) => {
      this.video = true
      this.onlocal(stream)
    })
    this.$eventBus.$on('onremotestream', (stream) => {
      this.dim = false
      window.Janus.attachMediaStream(document.getElementById('remotevideo'), stream)
    })
    this.$eventBus.$on('ondata', (data) => {
      this.msgList.push({
        type: 'a',
        text: data
      })
      setTimeout(() => {
        this.scrollBtm()
      }, 10)
    })
  }
}
</script>

<style>
  .userLayout {
    position:fixed;
    bottom:25px;
    left:25px;
    padding:15px;
    z-index:100;
    width: 350px;
    height: 550px;
    overflow:hidden;
    background-color:#fff;
    border-radius: 12px;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
  }
  .userLayout .confirm {
    position: relative;
    text-align: center;
  }
  .userLayout .confirm p {
    padding-top:100px;
    padding-bottom:255px;
    color:#697282;
    font-weight:bold;
    background: url(./../assets/webrtc1.png) left 100px no-repeat;
    background-size: 100% auto;
  }
  .userLayout .confirm .v-btn {
    position:absolute;
    top: 234px;
    left: 118px;
    width: 72px !important;
    height: 55px !important;
    font-weight: bold;
  }
  .userLayout .video {
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height: 100%;
    overflow:hidden;
    border-radius: 12px;
  }
  .userLayout #myvideo {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    width: 120px;
    border: 1px solid #dadada;
  }
  .userLayout #remotevideo {
    position:absolute;
    top:0;
    left: -75px;
    width: 500px;
    height: 375px;
    background-color:#cccccc;
  }
  .userLayout .txtBox {
    padding-top: 375px;
  }
  .userLayout .txtBox ul {
    border-top: 1px solid #e4e4e4;
    padding:10px 0;
    margin:0;
    height:134px;
    overflow-y: scroll;
  }
  .userLayout .txtBox ul li {
    padding:5px 0;
    font-size:14px;
    list-style: none;
  }
  .userLayout .txtBox ul li .v-icon {
    position:relative;
    top:-1px;
  }
  .userLayout .txtBox ul li.p {
    padding-left:15px;
  }
  .userLayout .txtBox ul li.a {
    padding-right:15px;
    text-align: right;
  }
  .userLayout .txtBox input {
    width: 100%;
    padding-left: 10px;
    padding-right: 100px;
    line-height:40px;
    font-size:14px;
    border-top: 1px solid #e4e4e4;
  }
  .userLayout .txtBox input:focus{
     outline: none;
  }
  .userLayout .txtBox .close {
    position: absolute;
    bottom: 6px;
    right: 6px;
  }
  .dim {
    position: absolute;
    top:0;
    left:0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background-color:rgba(0, 0, 0, 0.6);
  }
  .dim .v-progress-circular {
    position: absolute;
    top:50%;
    left:50%;
    margin:-16px 0 0 -16px;
  }
</style>
