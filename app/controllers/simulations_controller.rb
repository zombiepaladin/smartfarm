class SimulationsController < InheritedResources::Base
  respond_to :js, only: [:show]
  respond_to :json, only: [:show]
  
	before_filter :must_be_owner_or_member_or_admin, only: [:destroy]
	def must_be_owner  
		if current_user == nil
			redirect_to root_url, notice: "You are not signed in."
		elsif Simulation.find(params[:id]).user.id != current_user.id
			redirect_to @project, notice: "You do not have privileges to delete this record."
		end
	end

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
	# Edit or create copy to edit (if not owner)
	if Simulation.find(params[:id]).user.id != current_user.id
		@simulation = Simulation.find(params[:id]).dup
		@simulation.user = current_user
	else
		@simulation = Simulation.find(params[:id])
	end
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
