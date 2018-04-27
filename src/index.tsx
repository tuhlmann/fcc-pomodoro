import * as React from "react"
import * as ReactDOM from "react-dom"
import "../node_modules/materialize-css/dist/css/materialize.min.css"
import "../node_modules/materialize-css/dist/js/materialize.min.js"
import "./index.css"

// COPY FROM HERE

interface State {
  initialTimerValueMinutes: number
  isTimerRunning: boolean
  isTimerEditable: boolean
  timeToRun: number  
}

type ButtonEventCallback = (e: React.MouseEvent<HTMLButtonElement>) => void
type LinkEventCallback = (e: React.MouseEvent<HTMLAnchorElement>) => void

const ResetButton = (props) => (
  <button 
    className={"btn red darken-1 waves-effect waves-light " + props.className} 
    onClick={props.resetFn}
  >
    <span>
      <i className="fas fa-search left"></i> Reset
    </span>
  </button>
)

interface StartStopProps {
  className?: string
  isTimerRunning: boolean
  isTimerEditable: boolean
  startStop: ButtonEventCallback
}

const StartStopButton: React.SFC<StartStopProps> = ({className, isTimerRunning, isTimerEditable, startStop}) => {
  const cls = isTimerEditable ? `${className} disabled` : className
  return isTimerRunning ?
    <button className={"btn darken-1 waves-effect waves-light " + cls} onClick={startStop}>Stop</button>
  :
    (
      <button 
        className={"btn light-blue darken-1 waves-effect waves-light " + cls} 
        onClick={startStop}
      >Start
      </button>
    )
  }

interface DisplayPomodoroTimerProps {
  isTimerRunning: boolean
  displayStrFn: () => string
  editPomodoroTimeFn: LinkEventCallback
}

const DisplayPomodoroTimer: React.SFC<DisplayPomodoroTimerProps> = 
  ({ displayStrFn, isTimerRunning, editPomodoroTimeFn}) => (
    <div className="display-screen center-align">{displayStrFn()}
      <a
        href="#"
        onClick={editPomodoroTimeFn}
        className="right"
      >
      {!isTimerRunning ? <i className="material-icons">alarm</i> : <span></span>}
      </a>
    </div>
  )

interface EditPomodoroTimerProps {
  initialTimerValueMinutes: number
  changeTimerValueFn: (v: number) => void
  displayPomodoroTimeFn: LinkEventCallback
}

const EditPomodoroTimer: React.SFC<EditPomodoroTimerProps> = 
  ({ displayPomodoroTimeFn, initialTimerValueMinutes, changeTimerValueFn}) => (
    <div className="display-screen center-align">
      <div className="row m-b-0">
        <div className="input-field col s12">          
          <input 
            id="time-in-minutes"
            className="col s10 no-border m-b-0 font-s-16" 
            type="number" 
            step="1" 
            min="1" 
            max="60"
            defaultValue={initialTimerValueMinutes.toString()}
            onChange={e => changeTimerValueFn(e.target.valueAsNumber)}
          />
          <a
            href="#"
            onClick={displayPomodoroTimeFn}
            className="col s1 right m-t-10 m-r-5"
          ><i className="material-icons">done</i>
          </a>

          <label className="active">Time in Minutes</label>
        </div>  
      </div>  
    </div>
  )

class TomatoCutter extends React.Component<any, State> {

  currentTimer: any
  playedAudio: any

  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }

  initialState(): State {
    const initialMinutes = this.state && this.state.initialTimerValueMinutes || 25
    return {
      initialTimerValueMinutes: initialMinutes,
      isTimerRunning: false,
      isTimerEditable: false,
      timeToRun: initialMinutes * 60
    }
  }

  stopSound() {
    if (this.playedAudio) {
      this.playedAudio.pause()
      this.playedAudio.currentTime = 0
      this.playedAudio = null
    }
  }

  playSound() {
    this.playedAudio = new Audio("https://flukeout.github.io/simple-sounds/sounds/ping.mp3")
    this.playedAudio.loop = true
    this.playedAudio.play()
    setTimeout(() => {
      this.stopSound()
    }, 4000)
  }

  clearTimer() {
    clearInterval(this.currentTimer)
    this.currentTimer = null
    this.stopSound()
  }

  startStopTimer = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isTimerRunning = !this.state.isTimerRunning
    if (isTimerRunning) {
      this.currentTimer = setInterval(() => {
        const newTime = this.state.timeToRun - 1
        if (newTime <= 0) {
          this.clearTimer()
          this.playSound()
          this.setState(this.initialState())  
        } else {
          this.setState({timeToRun: newTime})  
        }
      }, 1000)
    } else {
      this.clearTimer()
    }
    this.setState({isTimerRunning: isTimerRunning})
  }

  resetTimer = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.currentTimer) {
      this.clearTimer()
    }
    this.stopSound()
    this.setState(this.initialState())
  }

  timeToRunDisp = () => {
    const min = Math.floor(this.state.timeToRun / 60)
    const sec = this.state.timeToRun % 60
    const minStr = min.toLocaleString(undefined, { minimumIntegerDigits: 2 })
    const secStr = sec.toLocaleString(undefined, { minimumIntegerDigits: 2 })
    return `${minStr}:${secStr}`
  }

  editPomodoroTimer = (f: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    this.setState({isTimerEditable: f})
  }

  changeTimerValue = (v: number) => {
    this.setState({ 
      initialTimerValueMinutes: v,
      timeToRun: v * 60 
    })
  }

  render() {
    return (
      <div id="calc-container">
        <div className="row valign-wrapper">
          <div className="card-container">
            <div className="card blue-grey darken-1 z-depth-4">
              <div className="card-content white-text">
                <span className="card-title center-align">Slicing Tomatoes</span>

                <div className="calc-grid-container">
                  <div className="box calc-display right-align">
                  {this.state.isTimerEditable ?
                      <EditPomodoroTimer 
                        displayPomodoroTimeFn={this.editPomodoroTimer(false)}
                        initialTimerValueMinutes={this.state.initialTimerValueMinutes}
                        changeTimerValueFn={this.changeTimerValue}
                      />
                    :
                      <DisplayPomodoroTimer 
                        displayStrFn={this.timeToRunDisp}
                        isTimerRunning={this.state.isTimerRunning} 
                        editPomodoroTimeFn={this.editPomodoroTimer(true)} 
                      />
                  }
                  </div>
                </div>

              </div>
              <div className="card-action">
                <ResetButton resetFn={this.resetTimer} />
                <StartStopButton 
                  className="right m-l-20" 
                  isTimerRunning={this.state.isTimerRunning} 
                  isTimerEditable={this.state.isTimerEditable} 
                  startStop={this.startStopTimer}
                />
              </div>
            </div>
            <p className="center-align">by <a href="http://www.agynamix.de" target="_blank">Torsten Uhlmann</a></p>
          </div>
        </div>
      </div >
    )
  }
}

ReactDOM.render(
  <TomatoCutter />,
  document.getElementById("root") as HTMLElement
)
