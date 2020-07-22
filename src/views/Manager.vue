<template>
  <div class="manager">
    <div class="videoBox">
      <div class="video">
        <div class="box">
          <div class="line">
            <div class="tit">Local Stream</div>
            <video class="rounded centered" id="myvideo" autoplay playsinline muted="muted"/>
          </div>
        </div>
        <div class="box notPad">
          <div class="line">
            <div class="tit">Remote Stream</div>
            <video class="rounded centered" id="remotevideo" autoplay playsinline></video>
          </div>
        </div>
      </div>
      <div class="msgBox">
        <ul>
          <li v-for="(item, index) in msgList" :key="index" :class="{p: item.type === 'p', a: item.type === 'a'}"><v-icon color="green" v-if="item.type === 'p'">mdi-account-circle</v-icon> {{item.text}} <v-icon color="#6a9aca" v-if="item.type === 'a'">mdi-account-circle</v-icon></li>
        </ul>
        <div class="input"><input type="text" value="test" v-model="text" placeholder="메시지를 입력해주세요." @keyup="checkEnter" /></div>
        <div class="close">
          <v-btn depressed small color="error" @click="hangup">Hangup</v-btn>
        </div>
      </div>
    </div>
    <v-dialog
      v-model="callPopup"
      width="500"
    >
      <v-card>
        <div class="txtPop">
          <strong>{{ username }}님</strong>으로부터 영상 통화 요청이 왔습니다.
        </div>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="doCall"
          >
            Answer
          </v-btn>
          <v-btn
            color="error"
            text
            @click="decline"
          >
            Decline
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Manager',
  data () {
    return {
      callPopup: false,
      spinner: null,
      username: '',
      jsep: null,
      text: '',
      msgList: []
    }
  },
  methods: {
    scrollBtm () {
      const container = document.querySelector('.msgBox ul')
      container.scrollTo(0, container.scrollHeight)
    },
    hangup () {
      let hangup = { request: 'hangup' }
      this.$janus.send({ message: hangup })
      this.$janus.hangup()
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
    doCall () {
      this.$janus.createAnswer({
        jsep: this.jsep,
        media: { data: true },
        simulcast: this.doSimulcast,
        success: (jsep) => {
          window.Janus.debug('Got SDP!', jsep)
          let body = { request: 'accept' }
          this.$janus.send({ message: body, jsep: jsep })
          // $('#call').removeAttr('disabled').html('Hangup')
          //   .removeClass("btn-success").addClass("btn-danger")
          //   .unbind('click').click(doHangup);
          this.callPopup = false
        },
        error: (error) => {
          window.Janus.error('WebRTC error:', error)
        }
      })
    },
    decline () {
      let hangup = { request: 'hangup' }
      this.$janus.send({ message: hangup })
      this.$janus.hangup()
      this.callPopup = false
    },
    getQueryStringValue (name) {
      let regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
      let results = regex.exec(location.search)
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
    },
    onlocal (stream) {
      window.Janus.debug(' ::: Got a local stream :::', stream)
      window.Janus.attachMediaStream(document.getElementById('myvideo'), stream)
      // document.getElementById('myvideo').muted = 'muted'
    }
  },
  mounted () {
    this.doSimulcast = (this.getQueryStringValue('simulcast') === 'yes' || this.getQueryStringValue('simulcast') === 'true')
    this.$janus.send({ message: { request: 'register', username: 'manager' } })
    this.$eventBus.$on('onmessage', (stream) => {
      let event = stream.msg.result.event
      this.username = stream.msg.result.username
      if (stream.jsep) {
        this.jsep = stream.jsep
      }
      if (event === 'incomingcall') {
        this.callPopup = true
      }
    })
    this.$eventBus.$on('onlocalstream', (stream) => {
      this.onlocal(stream)
    })
    this.$eventBus.$on('onremotestream', (stream) => {
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
  .txtPop {
    padding: 20px;
  }
  .manager {
    position:fixed;
    top:0;
    left:0;
    padding:20px;
    width: 100%;
    height: 100%;
    background-color:#cbcbcb;
  }
  .videoBox {
    padding:20px;
    overflow:hidden;
    border-radius: 6px;
    background-color:#fff;
  }
  .video {
    width: 100%;
    display:table;
  }
  .videoBox .box {
    position: relative;
    padding-right:8px;
    width:50%;
    float:left;
  }
  .videoBox .box video {
    width: 100%;
    height: 100%;
    vertical-align: top;
  }
  .videoBox .box.notPad {
    padding:0 0 0 8px;
  }
  .videoBox .box .line {
    position: relative;
    overflow:hidden;
    border:1px solid #e4e4e4;
    border-radius: 6px;
  }
  .videoBox .box .tit {
    position:absolute;
    top:0;
    left:0;
    width: 100%;
    line-height:40px;
    padding-left:10px;
    color:#fff;
    background: rgba(0, 0, 0, 0.4);
  }
  .videoBox .msgBox {
    position:relative;
    margin-top:10px;
    width: 100%;
    border:1px solid #e4e4e4;
    border-radius: 6px;
  }
  .videoBox .msgBox ul {
    border-top: 1px solid #e4e4e4;
    padding:10px 0;
    margin:0;
    height: 300px;
    overflow-y: scroll;
  }
  .videoBox .msgBox ul li {
    padding:5px 0;
    font-size:17px;
    list-style: none;
  }
  .videoBox .msgBox ul li .v-icon {
    position:relative;
    top:-1px;
    font-size:26px;
  }
  .videoBox .msgBox ul li.p {
    padding-left:15px;
  }
  .videoBox .msgBox ul li.a {
    padding-right:15px;
    text-align: right;
  }
  .videoBox .msgBox input {
    width: 100%;
    padding-left: 10px;
    line-height:40px;
    font-size:14px;
    border-top: 1px solid #e4e4e4;
  }
  .videoBox .msgBox input:focus{
    outline: none;
  }
  .videoBox .msgBox .close {
    position: absolute;
    bottom: 6px;
    right: 6px;
  }
</style>
