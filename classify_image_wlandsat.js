//----------------------------------------------------------------------------------------
//  Load in the Palsar data
//var palsar = ee.ImageCollection('users/etiennefluet/alos_hh_hathcockbay')
var hh_02_2008 = ee.Image('users/etiennefluet/alos_hh/AP_10898_FBS_F0590_RT2_HH');

//-------------------------------------------------------------------------------------
//  Function: Convert to sigma naught:  sarhh_sigma0 = 10 * log10 * DN^2 + -83.0
var conv_to_sigma0 = function(image) { return image.pow(2).log10().multiply(10).add(-83.0)};

//    Convert from DN to dB by applying functionover the collection.
var hh_02_2008  = conv_to_sigma0(hh_02_2008)

// rename for simplicity
var image = hh_02_2008

//-------------------------------------------------------------------------
// Read in Lansat imagery
// Filter by date, to closest image within a 2 week window

//    Find closest Landsat images
var landsat = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')


				.filterDate('2006-01-01','2010-12-31')
				.map(function(image) { return image.clip(hh_02_2008.geometry()); })
				//.clip(hh_02_2008.geometry())
//.filterBounds(geometry);
// var filter = ee.Filter.calendarRange(6,8, 'month');
// var filterLandsat = landsat.filter(filter);


// Display the inputs and the results.
Map.centerObject(landsat, 10);
var landsatVis = {min: 0, max: 40,};
Map.addLayer(landsat, landsatVis, 'landsat');






//, {min: 0, max: 2, palette: ['00FF00', 'FF0000','#2947FF']},'classification');
  // .filterBounds(BIOT)
  // .map(function(image){return image.clip(BIOT)}) ;

// Clip Landsat image to ALOS
// var clipped = ndvi.clip(corn.geometry())

// Combine ALOS and Lansat scenes ImageCollection


//------------------------------------------------------------------------------
// Get training points 

// // Merge points together
// var newfc = water.merge(urban).merge(forest);
var newfc = ee.FeatureCollection('users/etiennefluet/wetland_train_pts')


//-----------------------------------------------------------------------------------
//  Classify


// Select the bands for training
var bands = ['b1'];

// Overlay the points on the imagery to get training.
var training = image.sampleRegions({
  collection: newfc,
  properties: ['lc'],
  scale: 30
});

// Train a CART classifier with default parameters.
var trained = ee.Classifier.cart().train(training, 'lc', bands);

// Classify the image with the same bands used for training.
var classified = image.select(bands).classify(trained);



//-------------------------------------------------------------------
// Make map

// Display the inputs and the results.
Map.centerObject(hh_02_2008, 10);
var palsarVis = {min: -100.0, max: -70.0,};
Map.addLayer(hh_02_2008, palsarVis, 'hh_02_2008');

// Add classified layer
Map.addLayer(classified, {min: 0, max: 2, palette: ['00FF00', 'FF0000','#2947FF']},'classification');




//-----------------------------------------------------------------------------------
// https://gis.stackexchange.com/questions/269943/how-do-i-visualize-points-in-a-featurecollection-based-on-feature-properties-usi
// var palette = [{0:'FF0000'}, {1:'00FF00'}, {2:'0000FF'}];
var palette = ee.List(['FF0000', '00FF00', '0000FF'])//.slice(0, 3)
print(palette)

// Add long lat to image
var inputs = classified.addBands(image).addBands(ee.Image.pixelLonLat())

var points = inputs.stratifiedSample({
  numPoints: 100, 
  classBand: "class", 
  //region: geometry, 
  scale: 1000,
  classValues: [0, 1, 2],
  classPoints: [200, 200, 0]
})
  

var features = points.map(function(f) {
  var klass = f.get("lc")
  return ee.Feature(ee.Geometry.Point([f.get('longitude'), f.get('latitude')]), f.toDictionary())
      .set({style: {color: palette.get(klass) }})
})
Map.addLayer(features.style({styleProperty: "style"}))




// // Create an empty image into which to paint the features, cast to byte.
// var empty = ee.Image().byte();

// // Paint the interior of the polygons with different colors.
// var fills = empty.paint({  featureCollection: newfc, color: 'newfc',});

// Map.addLayer(fills, {palette: palette, max: 14}, 'colored fills');

// Paint both the fill and the edges.
//var newfcmap = empty.paint(newfc, 'lc').paint(newfc, 0, 2);
//Map.addLayer(newfcmap, {palette: ['000000'].concat(palette), max: 14}, 'edges and fills');

// Map.addLayer(newfcmap, {palette: palette, max: 2}, 'Training points');


//----------------------------------------------------------------
// Get a confusion matrix representing resubstitution accuracy.
print('RF error matrix: ', trained.confusionMatrix());
print('RF accuracy: ', trained.confusionMatrix().accuracy());


//-----------------------------------------------------------------------------------
// Make the histogram, set the options.
//var histogram = ui.Chart.image.histogram(palsar)

// Display the histogram.
//print(histogram);
