class Farm < ActiveRecord::Base
  has_paper_trail

  belongs_to :user

  validates_presence_of :user, :name, :latitude, :longitude, :data

end
