import { useEffect, useRef, useState } from "react";
import { effectLevels } from "./reel";
const vertex = `attribute vec2 a; varying vec2 uv; void main(){uv=vec2((a.x+1.0)*.5,(1.0-a.y)*.5);gl_Position=vec4(a,0,1);}`;
const fragment = `precision mediump float;
varying vec2 uv; uniform sampler2D picture; uniform float time, intensity, frame, still;
float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.54);}
vec3 sampleFilm(vec2 p){vec2 cell=vec2(mod(frame,2.0),floor(frame/2.0));return texture2D(picture,(cell+clamp(p,0.001,0.999))/vec2(2.,3.)).rgb;}
void main(){
 vec2 p=uv;
 float gate=floor(time*18.);
 float breathe=(1.-still)*sin(time*.43)*.004;
 p+=vec2(noise(vec2(gate,1.))-.5,noise(vec2(gate,2.))-.5)*.004*(1.-still);
 p=(p-.5)*(1.+breathe)+.5;
 float tracking=exp(-pow((p.y-fract(time*.045))/.021,2.))*(1.-still);
 p.x+=tracking*.0016*sin(p.y*170.+time*3.);
 vec2 d=p-.5; p+=d*dot(d,d)*(.018+intensity*.014);
 float tick=floor(time*12.); float band=step(.985,noise(vec2(floor(p.y*55.),tick)))*intensity*(1.-still);
 p.x+=band*.0015*sin(time*7.); float split=.0002+intensity*.0004;
 vec3 c=sampleFilm(p); c.r=sampleFilm(p+vec2(split,0.)).r; c.b=sampleFilm(p-vec2(split,0.)).b;
 float grain=(noise(uv*vec2(720.,480.)+tick)-.5)*(.095+intensity*.10);
 float scan=sin(p.y*880.)*.013; c+=grain-scan-tracking*.018;
 float mono=dot(c,vec3(.299,.587,.114));c=mix(c,vec3(mono),.35);
 c*=1.-dot(d,d)*(.45+intensity*.35);
 float exposure=1.-(1.-still)*(.035*sin(time*6.1)+.025*(noise(vec2(gate,4.))-.5));
 c*=exposure;
 float scratchX=.08+.84*noise(vec2(floor(time*.7),7.));
 float scratch=(1.-smoothstep(.0005,.0018,abs(p.x-scratchX)))*step(.45,noise(vec2(floor(time*3.),5.)));
 float dust=step(.998,noise(floor(p*vec2(160.,110.))+gate));
 c-=scratch*.16+dust*.22;
 c=mix(c,vec3(dot(c,vec3(.3,.59,.11)))*vec3(1.05,1.,.89),.35);
 if(p.x<0.||p.y<0.||p.x>1.||p.y>1.)c=vec3(.018);
 gl_FragColor=vec4(c,1.);
}`;
export function AnalogProjection({
  frame,
  still,
  alt,
}: {
  frame: number;
  still: boolean;
  alt: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    current = useRef({ frame, still });
  current.current = { frame, still };
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const gl = target.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      shaders.push(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    let program: WebGLProgram | null = null,
      texture: WebGLTexture | null = null,
      buffer: WebGLBuffer | null = null,
      raf = 0,
      disposed = false;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error("link");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const a = gl.getAttribLocation(program, "a");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const uniforms = Object.fromEntries(
        ["time", "frame", "intensity", "still"].map((n) => [
          n,
          gl.getUniformLocation(program!, n),
        ]),
      );
      const img = new Image();
      img.onload = () => {
        if (disposed) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        setReady(true);
        let previous = 0;
        const draw = (now: number) => {
          if (disposed) return;
          raf = requestAnimationFrame(draw);
          if (document.hidden || now - previous < 33) return;
          previous = now;
          const state = current.current;
          gl.viewport(0, 0, target.width, target.height);
          gl.uniform1f(uniforms.time, state.still ? 0 : now / 1000);
          gl.uniform1f(uniforms.frame, state.frame);
          gl.uniform1f(uniforms.intensity, effectLevels[state.frame] || 0.1);
          gl.uniform1f(uniforms.still, state.still ? 1 : 0);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        raf = requestAnimationFrame(draw);
      };
      img.src = "./media/avg/hidden-reel.png";
    } catch {
      setReady(false);
    }
    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setReady(false);
    };
    target.addEventListener("webglcontextlost", lost);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      target.removeEventListener("webglcontextlost", lost);
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteProgram(program);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
    };
  }, []);
  return (
    <div
      className="projection-image"
      role="img"
      aria-label={alt}
      data-renderer={ready ? "webgl" : "image"}
    >
      <div
        className="projection-fallback"
        style={{
          backgroundImage: "url('./media/avg/hidden-reel.png')",
          backgroundPosition: `${(frame % 2) * 100}% ${Math.floor(frame / 2) * 50}%`,
        }}
      />
      <canvas
        ref={canvas}
        width="1200"
        height="800"
        aria-hidden="true"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
