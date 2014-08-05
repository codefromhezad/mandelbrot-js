
var TO_LN2 = 1.0 / Math.LN2;
var CONVERGENCE_RADIUS = 4;
var CONVERGENCE_RADIUS_SQ = CONVERGENCE_RADIUS * CONVERGENCE_RADIUS;

function log2(p) {
    return Math.log(p) * TO_LN2;
}

function Mandelbrot(canvas_id) {

    this.palette = [];
    this.coordsMap = [];
    
    this.element = document.getElementById(canvas_id);
    this.context = this.element.getContext("2d");

    this.width  = this.element.width * 2;
    this.height = this.element.height * 2;

    this.paletteOffset = 100;
    this.coloringAlgorithm = Plugins.pixelShaders.real_escape_time.shader; 

    this.fractalFunc = Plugins.fractals.mandelbrot.iterator;
    this.pluginParams = null;

    var _width  = 1.0 / this.width;
    var _height = 1.0 / this.height;

    var imageData = this.context.createImageData(this.width * 0.5 | 0, this.height * 0.5 | 0);

    this.buildDefaultPalette = function() {
        for(var p = 0; p < 256; p++) {
            var a = Math.PI * 2.0 * p / 256
            this.palette[p] = [ 128 + 127 * Math.cos(a), 128 + 127 * Math.cos(a), 128 - 127 * Math.sin(a) ];
        }
    }

    this.setFractalFunction = function(funcname, params) {
        this.pluginParams = params;
        this.fractalFunc  = Plugins.fractals[funcname].iterator;
    }

    this.setPixelShader = function(funcname) {
        this.coloringAlgorithm = Plugins.pixelShaders[funcname].shader;
    }

    this.getPaletteColor = function(p) {
        if(p < 0) {
            return [0, 0, 0];
        }
        return this.palette[ (this.palette.length * Math.max(0, p + this.paletteOffset)) % (this.palette.length - 1) | 0 ];
    }

    this.canvasToFractalCoords = function(p) {
        return this.coordsMap[p.y * 2 | 0][p.x * 2 | 0];
    }

    this.render = function(scale, px, py) {
        var scale_2 = scale / 2;
        var scale_h = _height * scale;
        var scale_w = _width * scale;

        var iterationsMap = [];

        if( ! this.palette.length ) {
            this.buildDefaultPalette();
        }

        // First pass

        var y = py - scale_2;

        for (var j = 0; j < this.height; j++) {
            
            var x = px - scale_2;

            this.coordsMap[j] = [];
            iterationsMap[j] = [];

            for (var i = 0; i < this.width; i++) {
                
                this.coordsMap[j][i] = {x: x, y: y};

                var converge = this.fractalFunc(x, y, this.pluginParams);
                
                if( converge ) {
                    iterationsMap[j][i] = -1;
                } else {
                    iterationsMap[j][i] = this.coloringAlgorithm();
                }

                x += scale_w;
            }

            y += scale_h;
        }
        
        // Second pass. Actual rendering
        var imgIndex = 0;

        for (var j = 0; j < this.height; j+=2) {
            for (var i = 0; i < this.width; i+=2) {

                var p = this.getPaletteColor(iterationsMap[j][i]);
                var p2 = this.getPaletteColor(iterationsMap[j][i+1]);
                var p3 = this.getPaletteColor(iterationsMap[j+1][i]);
                var p4 = this.getPaletteColor(iterationsMap[j+1][i+1]);

                var r = ((p[0] + p2[0] + p3[0] + p4[0]) * 0.25) | 0;
                var g = ((p[1] + p2[1] + p3[1] + p4[1]) * 0.25) | 0;
                var b = ((p[2] + p2[2] + p3[2] + p4[2]) * 0.25) | 0;

                imageData.data[imgIndex++] = r;
                imageData.data[imgIndex++] = g;
                imageData.data[imgIndex++] = b;
                imageData.data[imgIndex++] = 255;
            }
        }

        this.context.putImageData(imageData, 0, 0);
    }
}