# -*- coding: utf-8 -*-
"""Handle github utility related tests.

Copyright (C) 2018 Gitcoin Core

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

"""

from django.conf import settings
from django.test import TestCase
from django.test.utils import override_settings

from github.utils import BASE_URI, get_auth_url, org_name, repo_url


class GithubUtilitiesTest(TestCase):
    """Define tests for Github utils."""

    def test_get_auth_url(self):
        """Test the get_auth_url method."""
        redirect = '/funding/new'
        redirect_uri = BASE_URI + '/_github/callback?redirect_uri=' + BASE_URI + redirect

        assert get_auth_url(redirect) == 'https://github.com/login/oauth/authorize?' \
            'client_id={}&scope={}&redirect_uri={}' \
            .format(settings.GITHUB_CLIENT_ID, settings.GITHUB_SCOPE, redirect_uri)

    def test_repo_url(self):
        """Test the repo_url method."""
        assert repo_url('https://github.com/gitcoinco/web/issues/1') == 'https://github.com/gitcoinco/web'

    def test_org_name(self):
        """Test the org_name method."""
        assert org_name('https://github.com/gitcoinco/web/issues/1') == 'gitcoinco'
        assert org_name('https://github.com/gitcoinco/web/issues/1/') == 'gitcoinco'