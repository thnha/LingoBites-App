require "minitest/autorun"
require_relative "../../fastlane/signing_config"

class SigningConfigTest < Minitest::Test
  def test_blank_optional_value_is_treated_as_unset
    assert_nil SigningConfig.optional_env_value({ "PROFILE" => "" }, "PROFILE")
  end

  def test_non_blank_optional_value_is_preserved
    assert_equal "LingoBites App Store", SigningConfig.optional_env_value(
      { "PROFILE" => "LingoBites App Store" },
      "PROFILE"
    )
  end
end
