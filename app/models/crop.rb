class Crop < ActiveRecord::Base
  has_paper_trail
  
  belongs_to :user

  PROPERTIES = %w{ stem_and_leaf_biomass reproductive_organ_biomass storage_organ_biomass root_biomass standing_residue_biomass }
end
