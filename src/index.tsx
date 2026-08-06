import React from 'react';
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  registerRoot,
  staticFile,
} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

const FPS = 24;

type Scene = {
  id: string;
  src: string;
  trimStartSec: number;
  durationSec: number;
  sourceVolume: number;
  transitionFrames: number;
};

const scenes: Scene[] = [
  {id: 'arrival', src: 'video/01-arrival.mp4', trimStartSec: 0, durationSec: 7.55, sourceVolume: 0.08, transitionFrames: 8},
  {id: 'private', src: 'video/02-private-access.mp4', trimStartSec: 0, durationSec: 7.65, sourceVolume: 0.07, transitionFrames: 0},
  {id: 'fragments', src: 'video/03-fragments.mp4', trimStartSec: 0, durationSec: 7.75, sourceVolume: 0.08, transitionFrames: 8},
  {id: 'rene', src: 'video/04-rene-digital.mp4', trimStartSec: 0.15, durationSec: 7.25, sourceVolume: 0, transitionFrames: 0},
  {id: 'tzome-fragments', src: 'video/05-tzome-fragments.mp4', trimStartSec: 0, durationSec: 5.55, sourceVolume: 0, transitionFrames: 8},
  {id: 'convergence', src: 'video/06-convergence.mp4', trimStartSec: 4.75, durationSec: 3.2, sourceVolume: 0.04, transitionFrames: 8},
  {id: 'speech', src: 'video/07-speech-umbral.mp4', trimStartSec: 0, durationSec: 7.75, sourceVolume: 0, transitionFrames: 6},
  {id: 'crossing', src: 'video/08-crossing.mp4', trimStartSec: 0.15, durationSec: 7.7, sourceVolume: 0.07, transitionFrames: 0},
  {id: 'table', src: 'video/09-table-reveal.mp4', trimStartSec: 0.15, durationSec: 7.7, sourceVolume: 0.05, transitionFrames: 0},
  {id: 'box-wide', src: 'video/10-box-wide.mp4', trimStartSec: 0, durationSec: 3.05, sourceVolume: 0.07, transitionFrames: 0},
  {id: 'box-essences', src: 'video/11-box-essences.mp4', trimStartSec: 2.85, durationSec: 12.1, sourceVolume: 0.11, transitionFrames: 0},
  {id: 'immobility', src: 'video/12-immobility.mp4', trimStartSec: 1, durationSec: 5.25, sourceVolume: 0.04, transitionFrames: 6},
  {id: 'custodios', src: 'video/13-custodios.mp4', trimStartSec: 1, durationSec: 4.75, sourceVolume: 0.04, transitionFrames: 0},
  {id: 'ignition', src: 'video/14-ignition.mp4', trimStartSec: 0, durationSec: 4.6, sourceVolume: 0.1, transitionFrames: 0},
  {id: 'heart', src: 'video/15-heart.mp4', trimStartSec: 0, durationSec: 7.85, sourceVolume: 0.12, transitionFrames: 0},
];

const sceneFrames = (scene: Scene) => Math.round(scene.durationSec * FPS);
const trimFrames = (scene: Scene) => Math.round(scene.trimStartSec * FPS);
const TOTAL_FRAMES =
  scenes.reduce((sum, scene) => sum + sceneFrames(scene), 0) -
  scenes.reduce((sum, scene) => sum + scene.transitionFrames, 0);

const startFrameOf = (id: string) => {
  let frame = 0;
  for (const scene of scenes) {
    if (scene.id === id) return frame;
    frame += sceneFrames(scene) - scene.transitionFrames;
  }
  return 0;
};

const SceneClip: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Video
      src={staticFile(scene.src)}
      trimBefore={trimFrames(scene)}
      volume={scene.sourceVolume}
      style={{width: '100%', height: '100%', objectFit: 'cover'}}
    />
  </AbsoluteFill>
);

const MusicBed: React.FC = () => {
  const crossing = startFrameOf('crossing');
  const crossStart = Math.max(0, crossing - 48);
  const crossFrames = 96;
  const endingFade = 60;

  return (
    <>
      <Audio
        src={staticFile('audio/music/Inheritance.mp3')}
        volume={(frame) => {
          const intro = interpolate(frame, [0, 36], [0, 0.17], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          if (frame < crossStart) return intro;
          return interpolate(frame, [crossStart, crossStart + crossFrames], [0.17, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
        }}
      />
      <Sequence from={crossStart}>
        <Audio
          src={staticFile('audio/music/Mesa-Espera.mp3')}
          volume={(localFrame) => {
            const globalFrame = crossStart + localFrame;
            const enter = interpolate(localFrame, [0, crossFrames], [0, 0.18], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const leave = interpolate(
              globalFrame,
              [TOTAL_FRAMES - endingFade, TOTAL_FRAMES - 1],
              [1, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            );
            return enter * leave;
          }}
        />
      </Sequence>
    </>
  );
};

const voiceCues = [
  {src: 'audio/voice/VO01-prologo.mp3', from: Math.round(0.55 * FPS), volume: 0.92},
  {src: 'audio/voice/VO03-umbral.mp3', from: startFrameOf('convergence') + Math.round(0.45 * FPS), volume: 0.94},
  {src: 'audio/voice/VO04-caja.mp3', from: startFrameOf('box-wide') + Math.round(0.2 * FPS), volume: 0.94},
  {src: 'audio/voice/VO05-inmovilidad.mp3', from: startFrameOf('immobility') + Math.round(0.2 * FPS), volume: 0.98},
  {src: 'audio/voice/VO06-fuego.mp3', from: startFrameOf('custodios') + Math.round(0.15 * FPS), volume: 0.95},
];

const VoiceTrack: React.FC = () => (
  <>
    {voiceCues.map((cue) => (
      <Sequence key={cue.src} from={cue.from}>
        <Audio src={staticFile(cue.src)} volume={cue.volume} />
      </Sequence>
    ))}
  </>
);

const RescoldoFinal: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <TransitionSeries>
      {scenes.map((scene, index) => (
        <React.Fragment key={scene.id}>
          <TransitionSeries.Sequence durationInFrames={sceneFrames(scene)}>
            <SceneClip scene={scene} />
          </TransitionSeries.Sequence>
          {scene.transitionFrames > 0 && index < scenes.length - 1 ? (
            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({durationInFrames: scene.transitionFrames})}
            />
          ) : null}
        </React.Fragment>
      ))}
    </TransitionSeries>
    <MusicBed />
    <VoiceTrack />
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <Composition
    id="RESCOLDO-Umbral-Fuego-Final"
    component={RescoldoFinal}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

registerRoot(Root);
