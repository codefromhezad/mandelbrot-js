
var TO_LN2 = 1.0 / Math.LN2;
var CONVERGENCE_RADIUS = 2;
var CONVERGENCE_RADIUS_SQ = CONVERGENCE_RADIUS * CONVERGENCE_RADIUS;

function log2(p) {
    return Math.log(p) * TO_LN2;
}

var COLORING = {
    ESCAPE_TIME: 1,
    SMOOTH_ESCAPE_TIME: 2 
};

function Mandelbrot(canvas_id) {

    this.palette = [];
    this.coordsMap = [];
    
    this.element = document.getElementById(canvas_id);
    this.context = this.element.getContext("2d");

    this.width  = this.element.width;
    this.height = this.element.height;

    this.coloringAlgorithm = COLORING.SMOOTH_ESCAPE_TIME; 

    var _width  = 1.0 / this.width;
    var _height = 1.0 / this.height;

    var imageData = this.context.createImageData(this.width, this.height);

    this.buildDefaultPalette = function() {
        for(var p = 0; p < 512; p++) {
            var a = Math.PI * 2 * p / 512
            this.palette[p] = [ 127 + 128 * Math.cos(a), 128 - 128 * Math.sin(a), 150 ];
        }
    }

    this.getPaletteColor = function(p) {
        //return this.palette[ Math.max(0, Math.min(p, this.palette.length - 1)) | 0 ];
        return this.palette[ Math.max(0, p % (this.palette.length - 1)) | 0 ];
    }

    this.canvasToFractalCoords = function(p) {
        return this.coordsMap[p.y | 0][p.x | 0];
    }

    this.render = function(scale, px, py) {
        var scale_2 = scale / 2;
        var scale_h = _height * scale;
        var scale_w = _width * scale;

        if( ! this.palette.length ) {
            this.buildDefaultPalette();
        }

        var imgIndex = 0;

        var y = py - scale_2;

        for (var j = 0; j < this.height; j++) {
            
            var x = px - scale_2;
            this.coordsMap[j] = [];

            for (var i = 0; i < this.width; i++) {
                
                this.coordsMap[j][i] = {x: x, y: y};

                var Zx = 0.0;
                var Zy = 0.0;

                var converge = true;
                var x_y = Zx * Zx - Zy * Zy;

                for(var n = 0; n < MAX_ITERATIONS; n++) {
                    //Z = Z * Z + c
                    Zy = y + 2.0 * Zx * Zy;
                    Zx = x + x_y;

                    x_y = Zx * Zx - Zy * Zy;

                    if( x_y > CONVERGENCE_RADIUS_SQ ) {
                        converge = false;
                        break;
                    }
                }

                if( converge ) {
                    var r = 0.0;
                    var g = 0.0;
                    var b = 0.0;
                } else {
                    Zy = y + 2.0 * Zx * Zy;
                    Zx = x + x_y;
                    x_y = Zx * Zx - Zy * Zy;

                    Zy = y + 2.0 * Zx * Zy;
                    Zx = x + x_y;
                    //x_y = Zx * Zx - Zy * Zy;

                    x_y = Zx * Zx + Zy * Zy;

                    switch( this.coloringAlgorithm ) {
                        case COLORING.ESCAPE_TIME:
                            var cn = 80 * this.palette.length * n / MAX_ITERATIONS;
                            break;
                        case COLORING.SMOOTH_ESCAPE_TIME:
                            var cn = 80 * this.palette.length * (n - Math.log( Math.log( Math.sqrt(x_y) ) ) * TO_LN2 ) / MAX_ITERATIONS;
                            break;
                        default:
                            console.error('A coloring algorithm must be set.');
                            return;
                    }

                    var p = this.getPaletteColor(cn);

                    var r = p[0] | 0;
                    var g = p[1] | 0;
                    var b = p[2] | 0;
                }

                imageData.data[imgIndex++] = r;
                imageData.data[imgIndex++] = g;
                imageData.data[imgIndex++] = b;
                imageData.data[imgIndex++] = 255;

                x += scale_w;
            }

            y += scale_h;
        }

        this.context.putImageData(imageData, 0, 0);
    }
}