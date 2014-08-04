
var TO_LN2 = 1.0 / Math.LN2;
var CONVERGENCE_RADIUS = 4;
var CONVERGENCE_RADIUS_SQ = CONVERGENCE_RADIUS * CONVERGENCE_RADIUS;

function log2(p) {
    return Math.log(p) * TO_LN2;
}

var COLORING = {
    ESCAPE_TIME: 'Escape Time',
    SMOOTH_ESCAPE_TIME: 'Smooth Escape Time' 
};

var FRACTAL = {
    MANDELBROT: 'Mandelbrot',
    MANDELBROT_CUBIC: 'Cubic Mandelbrot',
    JULIA: 'Julia [c = -0.4 + 0.6i]',
}

function Mandelbrot(canvas_id) {

    this.palette = [];
    this.coordsMap = [];
    
    this.element = document.getElementById(canvas_id);
    this.context = this.element.getContext("2d");

    this.width  = this.element.width;
    this.height = this.element.height;

    this.paletteOffset = 10;
    this.coloringAlgorithm = COLORING.SMOOTH_ESCAPE_TIME; 

    this.fractalType = FRACTAL.MANDELBROT;

    var _width  = 1.0 / this.width;
    var _height = 1.0 / this.height;

    var imageData = this.context.createImageData(this.width, this.height);

    this.buildDefaultPalette = function() {
        for(var p = 0; p < 512; p++) {
            var a = Math.PI * 2.0 * p / 512
            this.palette[p] = [ 128 - 127 * Math.cos(a), 128 - 127 * Math.sin(a), 128 - 127 * Math.sin(a) ];
        }
    }

    this.getPaletteColor = function(p) {
        return this.palette[ (this.palette.length * Math.max(0, p + this.paletteOffset)) % (this.palette.length - 1) | 0 ];
    }

    this.canvasToFractalCoords = function(p) {
        return this.coordsMap[p.y | 0][p.x | 0];
    }

    this.render = function(scale, px, py) {
        var scale_2 = scale / 2;
        var scale_h = _height * scale;
        var scale_w = _width * scale;

        var iterationsMap = [];

        if( ! this.palette.length ) {
            this.buildDefaultPalette();
        }

        var imgIndex = 0;

        var y = py - scale_2;

        for (var j = 0; j < this.height; j++) {
            
            var x = px - scale_2;

            this.coordsMap[j] = [];
            iterationsMap[j] = [];

            for (var i = 0; i < this.width; i++) {
                
                this.coordsMap[j][i] = {x: x, y: y};

                var Zx = 0.0;
                var Zy = 0.0;

                var converge = true;
                var xx = Zx * Zx;
                var yy = Zy * Zy;
                var mod = xx + yy;

                switch(this.fractalType) {
                    case FRACTAL.MANDELBROT:
                        for(var n = 0; n < MAX_ITERATIONS; n++) {
                            //Z = Z * Z + c
                            Zy = y + 2 * Zx * Zy;
                            Zx = x + xx - yy;

                            xx = Zx * Zx;
                            yy = Zy * Zy;
                            mod = xx + yy;

                            if( mod > CONVERGENCE_RADIUS_SQ ) {
                                converge = false;
                                break;
                            }
                        }
                        break;
                    case FRACTAL.MANDELBROT_CUBIC:
                        for(var n = 0; n < MAX_ITERATIONS; n++) {
                            //Z = Z * Z * Z + c
                            Zx = x + xx * Zx - 3 * Zx * yy;
                            Zy = y + 3 * xx * Zy - yy * Zy;

                            xx = Zx * Zx;
                            yy = Zy * Zy;
                            mod = xx + yy;

                            if( mod > CONVERGENCE_RADIUS_SQ ) {
                                converge = false;
                                break;
                            }
                        }
                        break;
                    case FRACTAL.JULIA:
                        Zx = x;
                        Zy = y;

                        var cx = -0.4;
                        var cy = 0.6;

                        var xx = Zx * Zx;
                        var yy = Zy * Zy;
                        var mod = xx + yy;

                        for(var n = 0; n < MAX_ITERATIONS; n++) {
                            //Z = Z * Z + c
                            Zy = cy + 2 * Zx * Zy;
                            Zx = cx + xx - yy;

                            xx = Zx * Zx;
                            yy = Zy * Zy;

                            mod = xx + yy;

                            if( mod > CONVERGENCE_RADIUS_SQ ) {
                                converge = false;
                                break;
                            }
                        }
                        break;
                    default:
                        console.error('A fractal type must be set');
                }
                

                if( converge ) {
                    iterationsMap[j][i] = -1;
                } else {
                    switch( this.coloringAlgorithm ) {
                        case COLORING.ESCAPE_TIME:
                            iterationsMap[j][i] = n / MAX_ITERATIONS;
                            break;
                        case COLORING.SMOOTH_ESCAPE_TIME:
                            var lnDivisor = TO_LN2;
                            if(this.fractalType == FRACTAL.MANDELBROT_CUBIC) {
                                lnDivisor = 1.0 / Math.log(3);
                            }

                            iterationsMap[j][i] = (n + 1 + Math.log(Math.log(CONVERGENCE_RADIUS_SQ) - Math.log(Math.log(Math.sqrt(mod)))) * lnDivisor) / MAX_ITERATIONS;
                            break;
                        default:
                            console.error('A coloring algorithm must be set.');
                            return;
                    }
                }

                x += scale_w;
            }

            y += scale_h;
        }
        
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {

                if( iterationsMap[j][i] == -1 ) {
                    var r = 0;
                    var g = 0;
                    var b = 0;
                } else {
                    var p = this.getPaletteColor(iterationsMap[j][i]);

                    var r = p[0] | 0;
                    var g = p[1] | 0;
                    var b = p[2] | 0;
                }

                imageData.data[imgIndex++] = r;
                imageData.data[imgIndex++] = g;
                imageData.data[imgIndex++] = b;
                imageData.data[imgIndex++] = 255;
            }
        }

        this.context.putImageData(imageData, 0, 0);
    }
}