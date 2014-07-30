
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
            this.palette[p] = [ Math.min(p, 255), p/2, 200 ];
        }
    }

    this.getPaletteColor = function(p) {
        return this.palette[ Math.min(this.palette.length - 1, Math.max(0, p)) | 0 ];
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

            for (var i = 0; i < this.width; i++) {
                
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
                        x_y = Zx * Zx + Zy * Zy;
                        break;
                    }
                }

                if( converge ) {
                    var r = 0.0;
                    var g = 0.0;
                    var b = 0.0;
                } else {
                    switch( this.coloringAlgorithm ) {
                        case COLORING.ESCAPE_TIME:
                            var cn = 80 * this.palette.length * n / MAX_ITERATIONS;
                            break;
                        case COLORING.SMOOTH_ESCAPE_TIME:
                            var cn = 80 * this.palette.length * (n - log2( log2( Math.sqrt(x_y) ) ) ) / MAX_ITERATIONS;
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