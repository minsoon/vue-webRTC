const IsJanus = window.Janus
const opaqueId = IsJanus.randomString(12)

const opt = {
  server: 'https://ticket.thecloudgate.io:8089/janus',
  success: () => {
    opt.attach({
      plugin: 'janus.plugin.videocall',
      opaqueId: `videocalltest-${opaqueId}`,
      success: (pluginHandle) => {
        console.log(pluginHandle)
        // this.$router.push('/user')
      },
      error: (error) => {
        IsJanus.error('  -- Error attaching plugin...', error)
      },
      consentDialog: (on) => {
        IsJanus.debug('Consent dialog should be ' + (on ? 'on' : 'off') + ' now')
      },
      iceState: (state) => {
        IsJanus.log('ICE state changed to ' + state)
      },
      mediaState: (medium, on) => {
        IsJanus.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
      },
      webrtcState: (on) => {
        IsJanus.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now')
      },
      onmessage: (msg, jsep) => {
        IsJanus.debug(' ::: Got a message :::', msg)
      },
      onlocalstream: (stream) => {
        IsJanus.debug(' ::: Got a local stream :::', stream)
      },
      onremotestream: (stream) => {
        IsJanus.debug(' ::: Got a remote stream :::', stream)
      },
      ondataopen: (data) => {
        IsJanus.log('The DataChannel is available!')
      },
      ondata: (data) => {
        IsJanus.debug('We got data from the DataChannel!', data)
      },
      oncleanup: () => {
        IsJanus.log(' ::: Got a cleanup notification :::')
      }
    })
  },
  error: (error) => {
    console.log(error)
    IsJanus.error(error)
  }
}

export default new IsJanus(opt)
