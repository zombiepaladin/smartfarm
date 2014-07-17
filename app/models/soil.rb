class Soil < ActiveRecord::Base
  has_paper_trail
  belongs_to :user

  PROPERTIES = %w{ snow_cover water_content wilting_point percolation_travel_time porosity nitrate ammonium fresh_organic_nitrogen active_organic_nitrogen stable_organic_nitrogen labile_phosphorus bound_organic_phosphorus active_mineral_phosphorus stable_mineral_phosphorus flat_residue_carbon humus_carbon }

  def icons
    return 0 unless code
    bitmask = 0
    bitmask += 1 if code.scan(/nitrogen/).size > 0 
    bitmask += 2 if code.scan(/phosphorus/).size > 0
    bitmask += 4 if code.scan(/carbon/).size > 0
    bitmask
  end

end
