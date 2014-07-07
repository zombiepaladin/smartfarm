class Weather < ActiveRecord::Base
  has_paper_trail
  belongs_to :user

  def icons
    bitmask = 0
    bitmask += 1 if code.scan(/set_rainfall/).size > 0
    bitmask += 2 if code.scan(/set_snowfall/).size > 0
    bitmask += 4 if code.scan(/set_wind_speed/).size > 0
    bitmask += 8 if code.scan(/set_wind_direction/).size > 0
    bitmask += 16 if code.scan(/set_relative_humidity/).size > 0
    bitmask
  end
end
