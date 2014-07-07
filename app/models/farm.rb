class Farm < ActiveRecord::Base
  has_paper_trail

  belongs_to :user

  validates_presence_of :user, :name, :latitude, :longitude, :data

  def static_map_url
    ["http://maps.googleapis.com/maps/api/staticmap?", #key=AIzaSyAWk3UQFfLP1-q-VrLd46sKcZ-RyYMDfTM",
       "markers=color:red|#{latitude},#{longitude}",
       "zoom=13",
       "maptype=terrain",
       "size=600x300"
      ].join("&")
   end

end
