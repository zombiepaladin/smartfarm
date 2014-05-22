require 'test_helper'

class WeatherControllerTest < ActionController::TestCase
  setup do
    @weather = weather(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:weather)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create weather" do
    assert_difference('Weather.count') do
      post :create, weather: { code: @weather.code, description: @weather.description, name: @weather.name, workspace: @weather.workspace }
    end

    assert_redirected_to weather_path(assigns(:weather))
  end

  test "should show weather" do
    get :show, id: @weather
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @weather
    assert_response :success
  end

  test "should update weather" do
    patch :update, id: @weather, weather: { code: @weather.code, description: @weather.description, name: @weather.name, workspace: @weather.workspace }
    assert_redirected_to weather_path(assigns(:weather))
  end

  test "should destroy weather" do
    assert_difference('Weather.count', -1) do
      delete :destroy, id: @weather
    end

    assert_redirected_to weather_index_path
  end
end
