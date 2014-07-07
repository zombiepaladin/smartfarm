class Soil < ActiveRecord::Base
  has_paper_trail
  belongs_to :user

  PROPERTIES = %w{ water_content nitrate ammonium fresh_organic_nitrogen active_organic_nitrogen stable_organic_nitrogen labile_phosphorus bound_organic_phosphorus active_mineral_phosphorus stable_mineral_phosphorus flat_residue_carbon humus_carbon }
end
