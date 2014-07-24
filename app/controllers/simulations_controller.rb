class SimulationsController < InheritedResources::Base
  respond_to :js, only: [:show]
  respond_to :json, only: [:show]

  def index
    @simulations = Simulation.page
    index!
  end
  
  def new
    @simulation = Simulation.new
    @farms = Farm.page
    @weather = Weather.page
    @soils = Soil.page
    new!
  end

  def show
    @simulation = Simulation.find(params[:id])
    @crops = Crop.page
    show!
  end

  def create
    @simulation = Simulation.new(resource_params)
    @simulation.user = current_user
    @farms = Farm.page
    @weather = Weather.page
    @soils = Soil.page
    create!
  end

  def edit
    @simulation = Simulation.find(params[:id])
    @farms = Farm.page
    @weather = Weather.page
    @soils = Soil.page
    @crops = Crop.page 
    edit!
  end

private

  def resource_params
    params.require(:simulation).permit(:name, :start_on, :end_on, :description, :farm_id, :weather_id, :soil_id, :state)
  end

end
