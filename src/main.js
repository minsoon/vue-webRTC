// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vuetify from './plugins/vuetify'
import EventBus from './eventBus/index'

Object.defineProperties(Vue.prototype, {
  $eventBus: {
    get: function () {
      return EventBus
    }
  }
})

const isJanus = () => {
  return new Promise((resolve) => {
    const janus = window.Janus
    let setJanus
    janus.init({
      debug: true,
      callback: () => {
        const opaqueId = janus.randomString(12)
        setJanus = new window.Janus({
          server: 'https://ticket.thecloudgate.io:8089/janus',
          success: () => {
            setJanus.attach({
              plugin: 'janus.plugin.videocall',
              opaqueId: `videocalltest-${opaqueId}`,
              success: (pluginHandle) => {
                resolve(pluginHandle)
              },
              error: (error) => {
                window.Janus.error('  -- Error attaching plugin...', error)
              },
              consentDialog: (on) => {
                window.Janus.debug('Consent dialog should be ' + (on ? 'on' : 'off') + ' now')
              },
              iceState: (state) => {
                window.Janus.log('ICE state changed to ' + state)
              },
              mediaState: (medium, on) => {
                window.Janus.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
              },
              webrtcState: (on) => {
                window.Janus.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now')
              },
              onmessage: (msg, jsep) => {
                console.log('onmessage ::: Got a local stream :::', msg, jsep)
                EventBus.$eventBus.$emit('onmessage', {
                  msg: msg,
                  jsep: jsep
                })
                window.Janus.debug(' ::: Got a message :::', msg)
              },
              onlocalstream: (stream) => {
                EventBus.$eventBus.$emit('onlocalstream', stream)
                console.log('onlocalstream ::: Got a local stream :::', stream)
              },
              onremotestream: (stream) => {
                EventBus.$eventBus.$emit('onremotestream', stream)
                console.log('onremotestream ::: Got a remote stream :::', stream)
              },
              ondataopen: (data) => {
                window.Janus.log('The DataChannel is available!')
              },
              ondata: (data) => {
                EventBus.$eventBus.$emit('ondata', data)
                window.Janus.debug('We got data from the DataChannel!', data)
              },
              oncleanup: () => {
                window.Janus.log(' ::: Got a cleanup notification :::')
              }
            })
          },
          error: (error) => {
            window.Janus.error(error)
          }
        })
      }
    })
  })
}

Vue.config.productionTip = false
window.getJanus = null

isJanus().then((pluginHandle) => {
  Vue.prototype.$janus = pluginHandle
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    vuetify,
    components: { App },
    template: '<App/>'
  })
})
