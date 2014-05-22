class WeatherController < InheritedResources::Base
  respond_to :json, only: [:show, :update]

  def create
    @weather = Weather.new(resource_params)
    @weather.user = current_user
    create!
  end

  def new
    @weather = Weather.create(user: current_user)
    redirect_to edit_weather_path(@weather)
  end

  def update
    #TODO: Create a clone if we aren't the owner
    @weather = Weather.find(params[:id])
    if @weather.update(resource_params)
      render text: "Successfully saved #{@weather.name}"
    else
      render text: "Unable to save #{@weather.name}: #{@weather.errors.full_messages.join(', ')}" 
    end
  end

private

  def resource_params
    params.require(:weather).permit(:name, :code, :description, :workspace)
  end

end
