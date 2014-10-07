# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140921221335) do

  create_table "crops", force: true do |t|
    t.integer  "user_id"
    t.string   "name",        default: "Unnamed Crop"
    t.text     "description"
    t.text     "code"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "workspace"
  end

  create_table "farms", force: true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.text     "description"
    t.float    "latitude"
    t.float    "longitude"
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "simulations", force: true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.date     "start_on"
    t.date     "end_on"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "state"
    t.string   "farm"
    t.string   "weather"
    t.integer  "farm_id"
    t.integer  "weather_id"
    t.integer  "soil_id"
  end

  create_table "soils", force: true do |t|
    t.integer  "user_id"
    t.string   "name",        default: "Unnamed soil"
    t.text     "description"
    t.text     "code"
    t.text     "workspace",   default: "<xml id=\"workspace\" style=\"display: none\"></xml>"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "taggings", force: true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true
  add_index "taggings", ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context"

  create_table "tags", force: true do |t|
    t.string  "name"
    t.integer "taggings_count", default: 0
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

  create_table "versions", force: true do |t|
    t.string   "item_type",  null: false
    t.integer  "item_id",    null: false
    t.string   "event",      null: false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"

  create_table "weather", force: true do |t|
    t.integer  "user_id"
    t.string   "name",        default: "Unamed Weather"
    t.text     "description"
    t.text     "code",        default: ""
    t.text     "workspace",   default: "<xml id=\"workspace\" style=\"display: none\"></xml>"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
