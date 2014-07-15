class Weather < ActiveRecord::Base
  has_paper_trail
  belongs_to :user

  PROPERTIES = %w{ rainfall snowfall solar_radiation day_length average_temperature low_temperature high_temperature wind_speed wind_direction dew_point relative_humidity } 

  def icons
    bitmask = 0
    bitmask += 1 if code.scan(/set_rainfall/).size > 0
    bitmask += 2 if code.scan(/set_snowfall/).size > 0
    bitmask += 4 if code.scan(/set_wind_speed/).size > 0
    bitmask += 8 if code.scan(/set_wind_direction/).size > 0
    bitmask += 16 if code.scan(/set_relative_humidity/).size > 0
    bitmask += 32 if code.scan(/set_solar_radiation/).size > 0
    bitmask
  end
end
