class Simulation < ActiveRecord::Base
  has_paper_trail
  belongs_to :user
  validates_presence_of :name, :start_on, :end_on

end
