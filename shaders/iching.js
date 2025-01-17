export const iching = /* glsl */ `
  #define TWO_PI 6.28318530718

  float shape(vec2 st, float N){
    st = st*2.-1.;
    float a = atan(st.x,st.y)+PI;
    float r = TWO_PI/N;
    return abs(cos(floor(.5+a/r)*r-a)*length(st));
  }

  float box(vec2 st, vec2 size){
      return shape(st*size,4.);
  }

  float rect(vec2 _st, vec2 _size){
      _size = vec2(0.5)-_size*0.5;
      vec2 uv = smoothstep(_size,_size+vec2(1e-4),_st);
      uv *= smoothstep(_size,_size+vec2(1e-4),vec2(1.0)-_st);
      return uv.x*uv.y;
  }

  float hex(vec2 st, float a, float b, float c, float d, float e, float f){
    st = st*vec2(2.,6.);

    vec2 fpos = fract(st);
    vec2 ipos = floor(st);

    if (ipos.x == 1.0) fpos.x = 1.-fpos.x;
    if (ipos.y < 1.0){
        return mix(box(fpos, vec2(0.84,1.)),box(fpos-vec2(0.03,0.),vec2(1.)),a);
    } else if (ipos.y < 2.0){
        return mix(box(fpos, vec2(0.84,1.)),box(fpos-vec2(0.03,0.),vec2(1.)),b);
    } else if (ipos.y < 3.0){
        return mix(box(fpos, vec2(0.84,1.)),box(fpos-vec2(0.03,0.),vec2(1.)),c);
    } else if (ipos.y < 4.0){
        return mix(box(fpos, vec2(0.84,1.)),box(fpos-vec2(0.03,0.),vec2(1.)),d);
    } else if (ipos.y < 5.0){
        return mix(box(fpos, vec2(0.84,1.)),box(fpos-vec2(0.03,0.),vec2(1.)),e);
    } else if (ipos.y < 6.0){
        return mix(box(fpos, vec2(0.84,1.)),box(fpos-vec2(0.03,0.),vec2(1.)),f);
    }
    return 0.0;
  }

  float hex(vec2 st, float N){
      float b[6];
      float remain = floor(mod(N,64.));
      for(int i = 0; i < 6; i++){
          b[i] = 0.0;
          b[i] = step(1.0,mod(remain,2.));
          remain = ceil(remain/2.);
      }
      return hex(st,b[0],b[1],b[2],b[3],b[4],b[5]);
  }

  float iching(vec2 st, float N, float padding, float size) {
    // FIXME: What are the range of numbers?
    float df = hex(st, N);

    // Outer padding
    df += (1.0 - rect(st, vec2(1.0 - padding * 2.0)));

    // Size of the tiles
    return step(size, 1.0 - df);
  }
`;
