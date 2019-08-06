# %% md
## ALOS classification of wetlands on GEE
#### Method overview:
# 1. Evaluate coverage of ALOS scenes; this step is currently coded in R.
# - Download metadata of Radio - metrically corrected(RTC) scenes(*DONE *)
# - Map number of overlapping scenes.
# - Map seasonal coverage of SWAMPS - GLWD inundation.
#


# 3. Gather scene granule over the training sites.
# - Lump small overlap polygons to reduce number of polygons to process.
#
# 4. Ingest ALOS scenes(GeoTIFFs) in GEE; with a batch script of Command Line tools.
# - First, in Google Cloud Storage
# with the command line.Ensure the bucket is public, so that GEE can access it.
# - Then, import the image to GEE.
# - The images transferred are: sigma-naught, incidence angle.
#
# 5. Classify stack
# of ALOS images as wetland / non - wetland.
# - Fit harmonic model on full time series.
# - Train classifier on: average EVI, parameters of SAR harmonic, topography
# - Test prepare in JS, then convert to Python.
#
# 6. Classify individual scenes of ALOS based on threshold.
# - Stack these classified scenes, to get average inundation period.
#
# 7. Save the classified image(s)
# - To asset, then save to drive, then download.

# %%

import os
os.chdir("C:/Users/efluet/Dropbox/alos/data/asf_scenes") # set directory

# %%  Training data
# 2. Prepare training data as points
# - Filter NWI for the US, by image year with the metadata polygon.Copy the water regime codes to the polygon attribute.
# - Africover

#%% Loop through NWI metadata grids.
execfile("./training_data/nwi_training_sites.py")


#%% Upload the shapefile to GEE
execfile("./gcs/fcn_transfer_from_local_to_gee_wcollection_v2.py")


# %%
# Download the images; passing the ROI poly coordinates.
# Select ALOS images to upload
# Get the granule list of images intersecting the zone.
execfile("./dl_alos_image/dl_alos_images.py")

# %%
# Unzip the HH image from each scene/Granule.
execfile("../../scripts/python/unzip_alos_hh.py")  # , globals())

# Upload the _HH image to GEE

# %%
# Run classification on GEE
# Use JS for development/visualization.
execfile("./js/classify_image_wlandsat_date_filter.js")
# Then convert to a Python API script that exports the classified output.

# %%
# Interactive visualization in the notebook.
# from __future__ import print_function
from ipyleaflet import *  # Map, basemaps, basemap_to_tiles

m = Map(center=(52, 10), zoom=8, basemap=basemaps.Hydda.Full)
m
# %%
import os

print(os.environ[
          r"$env:GOOGLE_APPLICATION_CREDENTIALS='C:\Users\efluet\Dropbox\alos\scripts\key\My First Project-e3eea9f7abba.json'"])
os.environ[
    'GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\efluet\Dropbox\alos\scripts\key\My First Project-e3eea9f7abba.json'

# %%
# Imports the Google Cloud client library
from google.cloud import storage

# Instantiates a client
storage_client = storage.Client()

# The name for the new bucket
bucket_name = 'alos-scenes-bucket'

# Creates the new bucket
bucket = storage_client.create_bucket(bucket_name)
print('Bucket {} created.'.format(bucket.name))

# %%
import environ

env = environ.Env.read_env()  # reading .env file
SECRET_KEY = env('SECRET_KEY')
# earthengine upload image --asset_id=users/username/asset_id gs://bucket/image.tif

# %%
# / Import ALOS GeoTIFFs
import os, ee
import commands

ee.Initialize()
# Use the Command Line Tool: https://developers.google.com/earth-engine/command_line#upload
# earthengine upload image --asset_id=users/username/asset_id gs://bucket/image.tif

# Print list of assets
ls = os.system('earthengine ls users/etiennefluet')
print(ls)

print(commands.getoutput('earthengine ls users/etiennefluet'))

# %%
# Import vector point data
# Export to KML Export.table.toDrive())
# Then upload to Fusion Table or export to Earth Engine asset
# Export.table.toAsset()
# Load training points. The numeric property 'class' stores known labels.


# Train a CART classifier with default parameters.
# Classify the image with the same bands used for training.
# Display the inputs and the results.


# %% md
# To Do list:
#
# Tutorials available here:
# - https: // geoscripting - wur.github.io / Earth_Engine /  # WUR_Geoscripting_
# - https: // github.com / google / earthengine - api / blob / master / python / examples / ipynb / TF_demo1_keras.ipynb
# 1. Make map with ipyleaflet
# 2. upload Biomass Data

