// https://thebookofshaders.com/09/

export const circle = /* glsl */ `
  float circle(in vec2 _st, in float _radius){
    vec2 l = _st-vec2(0.5);
    return 1.-smoothstep(_radius-(_radius*0.01),
                         _radius+(_radius*0.01),
                         dot(l,l)*4.0);
  }
`;

export const box = /* glsl */ `
  float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
  }
`;

export const tile = /* glsl */ `
  vec2 tile(vec2 _st, float _zoom){
      _st *= _zoom;
      return fract(_st);
  }
`;

export const brickTile = /* glsl */ `
  float brickBox(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;
    vec2 uv = smoothstep(_size,_size+vec2(1e-4),_st);
    uv *= smoothstep(_size,_size+vec2(1e-4),vec2(1.0)-_st);
    return uv.x*uv.y;
  }

  float brickTile(vec2 _st, float _zoom) {
    _st *= _zoom;

    // Here is where the offset is happening
    _st.x += step(1.0, mod(_st.y, 2.0)) * 0.5;

    _st = fract(_st);

    return 1.0 - brickBox(_st, vec2(0.9));
  }
`;

export const rotateTilePattern = /* glsl */ `
  vec2 rotateTilePattern(vec2 _st) {
    // Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1.0, mod(_st.x, 2.0));
    index += step(1.0, mod(_st.y, 2.0)) * 2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if (index == 1.0) {
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st, PI * 0.5);
    } else if (index == 2.0) {
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st, PI * -0.5);
    } else if( index == 3.0) {
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st, PI);
    }

    return _st;
  }
`;
