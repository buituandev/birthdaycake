// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "@dotlottie/player-component";
import "./App.css";
import { Cake } from "./components/Cake";
import { CakeActions } from "./components/CakeActions";
import { Name } from "./components/Name";
import { CongratsMessage } from "./components/CongratsMessage";
import Joyride, { ACTIONS, CallBackProps } from "react-joyride";

// const version = import.meta.env.PACKAGE_VERSION;

const src = new URL("/assets/hbd2.mp3", import.meta.url).href;

const steps = [
  {
    target: "#candle",
    content: "Blow on the Lightning port to extinguish the candle.",
    placement: "bottom",
    disableBeacon: true,
  }
] as any;

// Empty steps for the second Joyride component
function App() {
  const [candleVisible, setCandleVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const microphoneStreamRef = useRef<MediaStream | undefined>(undefined);

  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(true);
  const [shareMode, setShareMode] = useState(false);

  const [name, setName] = useState("Huynh Nhat Nam");
  const nameRef = useRef<HTMLInputElement>(null);

  const lightCandle = useCallback(() => setCandleVisible(true), []);

  const turnOffTheCandle = useCallback(() => setCandleVisible(false), []);

  const toggleLightCandle = useCallback(
    () => setCandleVisible((prevState) => !prevState),
    []
  );

  const startAudio = useCallback(() => {
    setPlaying(true);
    audioRef.current.load();
    audioRef.current.play();
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    audioRef.current.pause();
    setPaused(true);
  }, []);

  const stopAudio = useCallback(() => {
    setPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPaused(false);
  }, []);

  const start = useCallback(() => {
    startAudio();
    lightCandle();
  }, [lightCandle, startAudio]);

  const stop = useCallback(() => {
    stopAudio();
    turnOffTheCandle();
    setTimeout(() => {
      nameRef.current ? nameRef.current.focus() : undefined;
    }, 0);
  }, [stopAudio, turnOffTheCandle]);

  const blowCandles = useCallback(async (stream: MediaStream) => {
    try {
      microphoneStreamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectBlow = () => {
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        const threshold = 43;

        if (average > threshold) {
          setCandleVisible(false);
        }
      };

      setInterval(detectBlow, 100);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, []);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action } = data;
      if (action === ACTIONS.RESET || action === ACTIONS.CLOSE) {
        // do something
        setRun(false);
        setTimeout(() => {
          nameRef.current ? nameRef.current.focus() : undefined;
        }, 0);
      }
    },
    [setRun]
  );

  const onEnded = useCallback(() => { }, []);

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setTimeout(() => {
        nameRef.current ? nameRef.current.blur() : undefined;
      }, 0);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (stream) {
          blowCandles(stream);
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    })();

    return () => {
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [blowCandles]);

  useLayoutEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sharedParam = urlParams.get("shared");
    if (sharedParam) {
      setCandleVisible(true);
      setShareMode(true);
    }
  }, []);

  useEffect(() => {
    // Set candle visible right away on first load
    setCandleVisible(true);
    
    const handleFirstClick = () => {
      startAudio();
      setCandleVisible(true);
      setRun(true);
      window.removeEventListener("click", handleFirstClick);
    };

    window.addEventListener("click", handleFirstClick);

    return () => {
      window.removeEventListener("click", handleFirstClick);
    };
  }, [startAudio]);

  useEffect(() => {
    startAudio();
    setRun(true); // Ensure steps are shown on initial load
  }, [startAudio]);

  const actionsVisibility = playing && !paused; // Hide buttons when not playing

  // Set default visibility to false
  const [, setButtonsVisible] = useState(false);

  useEffect(() => {
    setButtonsVisible(actionsVisibility);
  }, [actionsVisibility]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        justifyContent: "space-between",
        // border: "1px solid red",
      }}
    >
      <Joyride
        styles={{
          options: {
            zIndex: shareMode ? 10000 : 1000, // Ensure steps are visible
          },
          buttonSkip: {
            outline: 0,
          },
          buttonNext: {
            outline: 0,
          },
          buttonBack: {
            outline: 0,
          },
          buttonClose: {
            outline: 0,
          },
        }}
        steps={steps}
        showSkipButton
        callback={handleJoyrideCallback}
        hideBackButton
        hideCloseButton={false}
        showProgress
        spotlightClicks
      />

      <audio {...{ src, ref: audioRef, preload: "auto", onEnded }} />

      <div>
        <Name
          {...{
            ref: nameRef,
            name,
            setName,
            shareMode,
            playing,
            run,
            onKeyPress,
          }}
        />
        <Cake {...{ candleVisible }} />
        <CongratsMessage name={name} playing={playing} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <dotlottie-player
          src="/assets/hbd.lottie"
          autoplay
          loop
          style={{
            zIndex: 20,
            visibility: actionsVisibility ? "visible" : "hidden",
            width: 400,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <dotlottie-player
          src="/assets/confetti.lottie"
          autoplay
          loop
          style={{
            zIndex: 30,
            visibility: actionsVisibility ? "visible" : "hidden",
            width: 400,
          }}
        />
      </div>

      {/* Hidden elements for Joyride steps to target */}
      <div 
        id="start" 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "10px",
          height: "10px",
          opacity: 0
        }}
      ></div>
      
      <div
        style={{
          position: "absolute",
          bottom: "1.25%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0, // Make it invisible but still present in the DOM
          pointerEvents: "none" // Prevent interaction
        }}
      >
        <CakeActions
          {...{
            run,
            start,
            pause,
            stop,
            toggleLightCandle,
            setRun,
            playing,
            paused,
            candleVisible,
          }}
        />
      </div>

      {/* <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "non",
        }}
      >
        {version}
      </div> */}
    </div>
  );
}

export default App;
