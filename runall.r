# /----------------------------------------------------------------------------#
#/    Run all: ALOS data summary
#     Description:  Summarizes all ALOS scenes

#   import libraries
source("./scripts/data_proc/import_libraries.r")
source("./scripts/plots/themes/line_plot_theme.R")


# /----------------------------------------------------------------------------#
#/    make request for scene metadata 
#     Loops through beam mode, years, lvls to keep request <100MB
#     Combine all outputs to one CSV
source("./scripts/data_proc/request_asf_beammodes_subsetloop.r")



#  ALOS scene counts - timeline of global coverage
source("./scripts/plots/barplot_alos_scenes.r")



# /----------------------------------------------------------------------------#
#/    Create polygons from ALOS scenes

# for 200k scenes: Scene prep: 3-s

source("./scripts/plots/make_poly_for_alos_scenes_parallel_v2.r")


# /----------------------------------------------------------------------------#
#/   Count scene overlaps                                                   ----

source("./scripts/global_summary/map_05deg_noverlap.r")

# for 200k scenes: Scene prep: 182s
#source("./scripts/data_proc/get_overlap_scene_count_v5.r")


# /-----------------------------------------------------------------------------
#/  Filter polygons
#   Remove small polygons, below a certain km^2
#   Look at adjacent neighbor polygons, select larges by area


# /----------------------------------------------------------------------------#
#/    Visualize overlapping scenes

source("./scripts/plots/barplot_noverlap_scenes.r")



# Global map of scene overlap                                            ----
# Mapping of 200k images: 2558.28s (42min) 
# Map 18k WB scenes: 127 sec
source("./scripts/plots/map_noverlap_scenes.r")



# /----------------------------------------------------------------------------#
#/   Characterize # of scenes and seasonality over EC towers


# plot tower overpasses
source("./scripts/plots/barplot_month_coverage_facet_allsites.r")



# /----------------------------------------------------------------------------#
#/    Map global scenes
#       |->  Number of overlap
#       |->  Temporal gap (largest gap, average gap)
#       |->  Index of how close to the highest water condition (taken from a modeled Q)

#    Make for subsets of scenes
#       |->  Only Low-res terrain corrected
#       |->  Format 1.5 of PLS, PLD, PLR  (30m resolution)
#       |->  Format 1.5 of PLS, PLD, PLR as well as  WB1, WB2 (100m res.)


