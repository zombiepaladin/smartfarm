class Simulation < ActiveRecord::Base
  has_paper_trail
  belongs_to :user
  belongs_to :farm
  belongs_to :weather
  validates_presence_of :name, :start_on, :end_on 
  validates_presence_of :farm_id, message: "must be selected"
  validates_presence_of :weather_id, message: "must be selected"

end
